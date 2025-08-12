import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function onRequestPost({ request }) {
  const body = await request.json();
  const chat_id = body.message?.chat.id;
  const text = body.message?.text;

  const reply = `You said: ${text}`;

  await fetch(`https://api.telegram.org/bot${Deno.env.get("BOT_TOKEN")}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text: reply })
  });

  return new Response("OK");
}import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function onRequestPost({ request }) {
  const body = await request.json();
  const chat_id = body.message?.chat.id;
  const text = body.message?.text;

  const reply = `You said: ${text}`;

  await fetch(`https://api.telegram.org/bot${Deno.env.get("BOT_TOKEN")}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text: reply })
  });

  return new Response("OK");
}
