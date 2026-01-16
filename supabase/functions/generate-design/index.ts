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
  customPrompt: z.string().max(500, "Custom prompt too long").optional(),
  budget: z.enum(["low", "medium", "high"], { errorMap: () => ({ message: "Invalid budget option" }) }),
});

function extractImageDataUrl(payload: any): string | null {
  const msg = payload?.choices?.[0]?.message;
  const fromImages = msg?.images?.[0]?.image_url?.url;
  if (typeof fromImages === "string" && fromImages.length) return fromImages;

  const content = msg?.content;
  if (typeof content === "string") {
    if (content.startsWith("data:image/")) return content;
  }

  if (Array.isArray(content)) {
    const imagePart = content.find(
      (p: any) => p?.type === "image_url" && typeof p?.image_url?.url === "string"
    );
    if (imagePart?.image_url?.url) return imagePart.image_url.url;

    const textPart = content.find(
      (p: any) => p?.type === "text" && typeof p?.text === "string" && p.text.startsWith("data:image/")
    );
    if (textPart?.text) return textPart.text;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let designIdForError: string | null = null;
  let adminClient: any = null;

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

    const { designId, imageUrl, roomType, styleMood, styleType, customPrompt, budget } = validationResult.data;
    designIdForError = designId;

    // Build style description - use custom prompt if provided, otherwise use predefined style
    const styleDescription = styleType === "custom" && customPrompt
      ? customPrompt
      : `${styleMood} mood with ${styleType} design style`;

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
    adminClient = supabase;

    // Rate limiting: Check requests in last hour (max 10 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: requestCount } = await supabase
      .from("room_designs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if (requestCount && requestCount >= 10) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" },
      });
    }

    // Mark as processing (best effort) so results page can show live state
    await supabase
      .from("room_designs")
      .update({ status: "processing", generated_image_url: null })
      .eq("id", designId);

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
            content: "You are an expert interior designer. Provide specific, actionable design suggestions.",
          },
          {
            role: "user",
            content:
              `I have a ${roomType.replace("-", " ")} that I want to redesign. ` +
              `Style preferences: ${styleDescription}, ${budget} budget. ` +
              `Provide 5-7 specific suggestions for: wall colors, furniture placement, lighting, decor items, and any structural changes. ` +
              `Be concise but specific.`,
          },
        ],
      }),
    });

    if (!suggestionsResponse.ok) {
      if (suggestionsResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (suggestionsResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add credits and try again." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`suggestions gateway error: ${suggestionsResponse.status}`);
    }

    const suggestionsData = await suggestionsResponse.json().catch(() => ({}));
    const suggestionsRaw = suggestionsData?.choices?.[0]?.message?.content;
    const suggestions = typeof suggestionsRaw === "string" && suggestionsRaw.trim().length
      ? suggestionsRaw
      : "Unable to generate suggestions.";

    // Generate redesigned image
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Transform this ${roomType.replace("-", " ")} into a beautifully designed space matching this style: ${styleDescription}. ` +
                  `Add furniture, wall paint, decor, and lighting appropriate for a ${budget} budget. ` +
                  `Make it look realistic and professionally designed.`,
              },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add credits and try again." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`image gateway error: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json().catch(() => ({}));
    const imageDataUrl = extractImageDataUrl(imageData);

    let generatedImageUrl: string | null = null;

    if (imageDataUrl) {
      const fileName = `${user.id}/generated-${designId}.png`;

      let imageBuffer: Uint8Array | null = null;
      let contentType = "image/png";

      if (imageDataUrl.startsWith("data:image/")) {
        const match = imageDataUrl.match(/^data:(image\/\w+);base64,/);
        if (match?.[1]) contentType = match[1];

        const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      } else if (imageDataUrl.startsWith("http")) {
        const fetched = await fetch(imageDataUrl);
        if (fetched.ok) {
          contentType = fetched.headers.get("content-type") || contentType;
          const buf = await fetched.arrayBuffer();
          imageBuffer = new Uint8Array(buf);
        }
      }

      if (imageBuffer) {
        const { error: uploadError } = await supabase.storage.from("room-images").upload(fileName, imageBuffer, {
          contentType,
          upsert: true,
        });

        if (!uploadError) {
          // Store the path, not the URL - client will generate signed URLs
          generatedImageUrl = fileName;
        }
      }
    }

    const finalStatus = generatedImageUrl ? "completed" : "failed";

    // Update design record
    await supabase
      .from("room_designs")
      .update({
        ai_suggestions: suggestions,
        generated_image_url: generatedImageUrl,
        status: finalStatus,
      })
      .eq("id", designId);

    return new Response(JSON.stringify({ success: true, status: finalStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log sanitized error server-side for debugging
    console.error("Design generation error:", {
      timestamp: new Date().toISOString(),
      designId: designIdForError,
      errorType: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
    });

    // Best-effort: mark the design as failed so the UI can offer a retry
    if (adminClient && designIdForError) {
      try {
        await adminClient
          .from("room_designs")
          .update({
            status: "failed",
            generated_image_url: null,
            ai_suggestions: "Generation failed. Please try again from the results page.",
          })
          .eq("id", designIdForError);
      } catch (updateErr) {
        console.error("Failed to mark design as failed:", updateErr);
      }
    }

    // Return a non-throwing response so the client can still navigate to results.
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate design. Please try again.",
        status: "failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
