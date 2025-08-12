// 🔐 Supabase Edge Function: updateBalance.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { userId, amount } = await req.json();

  if (!userId || typeof amount !== "number") {
    return new Response("Invalid payload", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 🔍 Check if wallet exists
  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  let newBalance = amount;

  if (wallet && !error) {
    newBalance += wallet.balance;
  }

  // 💰 Upsert wallet with new balance
  const { error: upsertError } = await supabase
    .from("wallets")
    .upsert({ user_id: userId, balance: newBalance });

  if (upsertError) {
    return new Response("Failed to update balance", { status: 500 });
  }

  return new Response(JSON.stringify({ balance: newBalance }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
