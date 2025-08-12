// 🔐 Supabase Edge Function: getBalance.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // ✅ Parse incoming request
  const { userId } = await req.json();

  // 🔐 Supabase client (locked credentials)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!
  );

  // 💰 Fetch wallet balance
  const { data, error } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ balance: 0 }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // ✅ Return balance
  return new Response(JSON.stringify({ balance: data.balance }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
