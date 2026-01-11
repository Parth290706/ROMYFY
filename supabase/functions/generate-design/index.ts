import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const RequestSchema = z.object({
  designId: z.string().uuid("Invalid design ID format"),
  imageUrl: z.string().url("Invalid image URL").max(2000, "URL too long"),
  roomType: z.string().min(1, "Room type required").max(50, "Room type too long"),
  styleMood: z.string().min(1, "Style mood required").max(50, "Style mood too long"),
  styleType: z.string().min(1, "Style type required").max(50, "Style type too long"),
  budget: z.enum(["low", "medium", "high"], { errorMap: () => ({ message: "Invalid budget option" }) }),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase configuration missing");

    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create authenticated client to verify user
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input
    const body = await req.json();
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid input", 
        details: validationResult.error.errors.map(e => e.message).join(", ")
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { designId, imageUrl, roomType, styleMood, styleType, budget } = validationResult.data;

    // Verify ownership of the design
    const { data: design, error: designError } = await supabaseAuth
      .from("room_designs")
      .select("user_id")
      .eq("id", designId)
      .single();

    if (designError || !design) {
      return new Response(JSON.stringify({ error: "Design not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (design.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client for admin operations (after ownership verified)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

    // Rate limiting: Check requests in last hour (max 10 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: requestCount } = await supabase
      .from("room_designs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (requestCount && requestCount >= 10) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded. Please try again later." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
      });
    }

    // Generate text suggestions
    const suggestionsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert interior designer. Provide specific, actionable design suggestions."
          },
          {
            role: "user",
            content: `I have a ${roomType.replace('-', ' ')} that I want to redesign. Style preferences: ${styleMood} mood, ${styleType} design type, ${budget} budget. Provide 5-7 specific suggestions for: wall colors, furniture placement, lighting, decor items, and any structural changes. Be concise but specific.`
          }
        ],
      }),
    });

    const suggestionsData = await suggestionsResponse.json();
    const suggestions = suggestionsData.choices?.[0]?.message?.content || "Unable to generate suggestions.";

    // Generate redesigned image
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Transform this ${roomType.replace('-', ' ')} into a beautifully designed space with ${styleMood} mood and ${styleType} style. Add furniture, wall paint, decor, and lighting appropriate for a ${budget} budget. Make it look realistic and professionally designed.` },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    const imageData = await imageResponse.json();
    let generatedImageUrl = null;

    if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
      const base64Image = imageData.choices[0].message.images[0].image_url.url;
      
      // Upload to storage
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const fileName = `generated/${designId}.png`;
      await supabase.storage.from('room-images').upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

      const { data: { publicUrl } } = supabase.storage.from('room-images').getPublicUrl(fileName);
      generatedImageUrl = publicUrl;
    }

    // Update design record
    await supabase.from('room_designs').update({
      ai_suggestions: suggestions,
      generated_image_url: generatedImageUrl,
      status: 'completed'
    }).eq('id', designId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error("Design generation error:", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.stack : error,
    });
    
    // Return generic error message to client (don't expose internal details)
    return new Response(JSON.stringify({ 
      error: "Failed to generate design. Please try again later." 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
