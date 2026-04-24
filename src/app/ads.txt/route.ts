const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const dynamic = "force-static";

export function GET() {
  if (!PUBLISHER_ID) {
    return new Response("", {
      headers: { "Content-Type": "text/plain" },
    });
  }
  const pubId = PUBLISHER_ID.replace(/^ca-/, "");
  return new Response(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain" },
  });
}
