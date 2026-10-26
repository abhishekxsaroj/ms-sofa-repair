import { handleEnquiry } from "./_lib/enquiry.js";

type VercelLikeRequest = {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

type VercelLikeResponse = {
  status: (code: number) => { json: (body: unknown) => void };
};

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method === "OPTIONS") {
    res.status(204).json({});
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const hostHeader = req.headers["x-forwarded-host"] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || "https";
  const origin = host ? `${proto}://${host}` : "https://ms-sofa-repair.vercel.app";

  const result = await handleEnquiry(req.body, { ip, origin });
  res.status(result.status).json(result.json);
}
