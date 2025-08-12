import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { userId } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 🔍 Count successful referrals
  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", userId)
    .eq("status", "confirmed");

  if ((count ?? 0) < 5) {
    return new Response(JSON.stringify({ payout: false }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // 💰 Trigger payout
  const payoutAmount = 100;
  const { error } = await supabase
    .from("wallets")
    .upsert({ user_id: userId, balance: payoutAmount }, { onConflict: "user_id", ignoreDuplicates: false });

  if (error) {
    return new Response("Payout failed", { status: 500 });
  }

  return new Response(JSON.stringify({ payout: true, amount: payoutAmount }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
