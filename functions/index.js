// Force redeploy: 2025-08-14
import { createClient } from "@supabase/supabase-js";
export default {
  async fetch(request, env, ctx) {
    try {
      // Initialize Supabase client with environment variables
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

      // Query the "users" table
      const { data, error } = await supabase.from("users").select("*").limit(1);

      // Return response
      return new Response(JSON.stringify({ data, error }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Consider restricting in production
        },
        status: error ? 500 : 200,
      });
    } catch (err) {
      // Handle unexpected errors
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  },
};
