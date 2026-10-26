import { handleEnquiry } from "./_lib/enquiry";

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

  const result = await handleEnquiry(req.body, { ip });
  res.status(result.status).json(result.json);
}
