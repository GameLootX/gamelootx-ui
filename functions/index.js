import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request, env, ctx) {
    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // Timeout controller
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // Query Supabase
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      return new Response(JSON.stringify({ data, error }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: error ? 500 : 200,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Unexpected error" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};
