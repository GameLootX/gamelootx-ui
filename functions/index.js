export async function onRequest() {
  return new Response("✅ Worker is alive", {
    headers: { "Content-Type": "text/plain" },
  });
}
