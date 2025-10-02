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
    const { conversationId, message } = await req.json();

    if (!conversationId || !message) {
      throw new Error("Missing conversationId or message");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Fetching conversation history...");
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) throw messagesError;

    console.log("Fetching FAQs for context...");
    const { data: faqs, error: faqsError } = await supabase
      .from("faqs")
      .select("question, answer, category")
      .limit(20);

    if (faqsError) throw faqsError;

    const faqContext = faqs
      .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}\nCategory: ${faq.category}`)
      .join("\n\n");

    const systemPrompt = `You are a professional finance customer service AI assistant. Your knowledge is based on real financial institution FAQs and current market data.

Your capabilities:
1. Answer questions about accounts, loans, fraud protection, investments, and general banking
2. Classify user intents: account_inquiry, loan_inquiry, fraud_report, investment_help, dispute, general, or other
3. Provide accurate information with source citations when possible
4. Be professional, helpful, and clear

FAQ Knowledge Base:
${faqContext}

When responding:
- Be concise but comprehensive
- If you reference FAQ information, cite the category
- If you're unsure, acknowledge it honestly
- Classify the intent of the user's question`;

    console.log("Calling Lovable AI...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...(messages || []),
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;

    console.log("AI Response:", assistantMessage);

    // Detect intent from the response
    const intentKeywords = {
      account_inquiry: ["account", "balance", "deposit", "withdrawal", "checking", "savings"],
      loan_inquiry: ["loan", "mortgage", "credit", "borrow", "interest rate", "refinance"],
      fraud_report: ["fraud", "suspicious", "unauthorized", "stolen", "scam", "security"],
      investment_help: ["invest", "portfolio", "stocks", "bonds", "retirement", "401k"],
      dispute: ["dispute", "charge", "error", "incorrect", "wrong", "complaint"],
    };

    let detectedIntent = "general";
    const lowerMessage = message.toLowerCase();

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        detectedIntent = intent;
        break;
      }
    }

    console.log("Detected intent:", detectedIntent);

    // Insert assistant message
    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantMessage,
      intent: detectedIntent,
      sources: faqContext ? ["FAQ Database"] : [],
    });

    if (insertError) {
      console.error("Error inserting message:", insertError);
      throw insertError;
    }

    console.log("Message inserted successfully");

    return new Response(
      JSON.stringify({
        success: true,
        intent: detectedIntent,
        message: assistantMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
