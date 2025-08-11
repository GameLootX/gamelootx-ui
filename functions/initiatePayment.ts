// /functions/initiatePayment.ts

export async function onRequestPost({ request }) {
  const body = await request.json();
  const { user_id, amount } = body;

  if (!user_id || !amount || amount < 10) {
    return new Response("Minimum deposit is $10", { status: 400 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const paymentPayload = {
    price_amount: amount,
    price_currency: "USD", // Locked currency
    pay_currency: "USD",   // User selects method on NOWPayments UI
    order_id: `GLX-${user_id}-${Date.now()}`,
    order_description: "GameLootX Deposit",
    ipn_callback_url: "https://gamelootx.fastrapids.com/ipn" // optional
  };

  const res = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(paymentPayload)
  });

  const data = await res.json();
  if (!data || !data.invoice_url) {
    return new Response("Payment creation failed", { status: 500 });
  }

  return new Response(JSON.stringify({ payment_url: data.invoice_url }), {
    headers: { "Content-Type": "application/json" }
  });
}
