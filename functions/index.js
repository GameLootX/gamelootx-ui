export async function onRequest(context) {
  const input = 'GameLootX'; // Replace with dynamic input

  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );

  const hexHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return new Response(`SHA-256 hash of "${input}": ${hexHash}`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
