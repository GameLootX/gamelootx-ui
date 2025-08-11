// /functions/ipn.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js";

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();

    const {
      payment_id,
      order_id,
      payment_status,
      price_amount,
      pay_currency
    } = body;

    // ✅ Only proceed if payment is marked as finished
    if (payment_status !== "finished") {
      return new Response("Payment not completed", { status: 200 });
    }

    // ✅ Extract user_id from order_id format: GLX-<user_id>-<timestamp>
    const parts = order_id?.split("-");
    const user_id = parts?.[1];

    if (!user_id) {
      return new Response("Invalid order_id format", { status: 400 });
    }

    // ✅ Connect to Supabase with locked credentials
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ✅ Insert deposit record
    const { error } = await supabase.from("deposits").insert({
      user_id,
      amount: price_amount,
      currency: pay_currency,
      payment_id,
      status: "completed",
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return new Response("Database error", { status: 500 });
    }

    return new Response("Deposit logged", { status: 200 });

  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Invalid payload", { status: 400 });
  }
}
