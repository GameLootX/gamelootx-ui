import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { message } = body;
    const chatId = message?.chat?.id;
    const text = message?.text;

    if (!chatId || !text) {
      return new Response("Invalid payload", { status: 400 });
    }

    let reply = "🤖 Command not recognized.";

    // Handle /connect_wallet
    if (text === "/connect_wallet") {
      await supabase.from("users").upsert({ id: chatId });
      reply = "🔗 Wallet connected successfully!";
    }

    // Handle /start with referral code
    if (text.startsWith("/start ")) {
      const referralCode = text.split(" ")[1];

      // Find referrer
      const { data: referrer } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", referralCode)
        .single();

      if (referrer) {
        // Tag new user
        await supabase.from("users").upsert({
          id: chatId,
          referrer_id: referrer.id
        });

        // Insert referral
        await supabase.from("referrals").insert({
          referral_code: referralCode,
          new_user: chatId,
          status: "pending"
        });

        reply = "🎉 Referral tracked! Welcome to GameLootX.";
      }
    }

    return new Response(JSON.stringify({ method: "sendMessage", chat_id: chatId, text: reply }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response("Internal error", { status: 500 });
  }
}
