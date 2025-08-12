import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://fzduhyreyrwczebvtsmg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6ZHVoeXJleXJ3Y3plYnZ0c21nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTgyMDMsImV4cCI6MjA3MDQ3NDIwM30.6tGss5avISLM76KRsxyZ-ub36Zsn5S4xzDu-JTr78"
);

export async function onRequest() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  return new Response(JSON.stringify({ data, error }), {
    headers: { "Content-Type": "application/json" },
  });
}
