import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { designId, imageUrl, roomType, styleMood, styleType, budget } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
