import { Resend } from "resend";

export const SERVICES = [
  "Sofa Repair & Reupholstery",
  "Custom Furniture",
  "Bed Repair & Custom Furnishing",
  "Mattress Repair & Replacement",
  "Dining Table & Chair Repair",
  "Recliner Chair Service",
  "Curtains & Home Furnishings",
  "Other",
] as const;

export const PREFERRED_TIMES = ["Anytime", "Morning", "Afternoon", "Evening"] as const;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

export type EnquiryPayload = {
  name: string;
  phone: string;
  service: string;
  message: string;
  locality?: string;
  preferredTime?: string;
  website?: string;
};

export type EnquiryResult = {
  status: number;
  json: { ok: boolean; error?: string };
};

export function normalizeIndianPhone(raw: string) {
  const compact = raw.replace(/[^\d+]/g, "");
  const digits = compact.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\+91[6-9]\d{9}$/.test(compact)) return compact;
  return null;
}

function prune(ip: string, now: number) {
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  hits.set(ip, recent);
  return recent;
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = prune(ip, now);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidName(name: string) {
  return name.length >= 2 && name.length <= 80;
}

function isValidMessage(message: string) {
  return message.length <= 2000;
}

function parseBody(body: unknown): EnquiryPayload | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;
  return {
    name: asString(input.name),
    phone: asString(input.phone),
    service: asString(input.service),
    message: asString(input.message),
    locality: asString(input.locality),
    preferredTime: asString(input.preferredTime),
    website: asString(input.website),
  };
}

function validate(payload: EnquiryPayload) {
  if (!isValidName(payload.name)) return "Please enter your full name.";
  if (!normalizeIndianPhone(payload.phone)) {
    return "Please enter a valid 10-digit Indian mobile number.";
  }
  if (!SERVICES.includes(payload.service as (typeof SERVICES)[number])) {
    return "Please select a service.";
  }
  if (!isValidMessage(payload.message)) {
    return "Please keep the message under 2000 characters.";
  }
  if (payload.locality && payload.locality.length > 80) {
    return "Locality is too long.";
  }
  if (
    payload.preferredTime &&
    !PREFERRED_TIMES.includes(payload.preferredTime as (typeof PREFERRED_TIMES)[number])
  ) {
    return "Please choose a valid contact time.";
  }
  return null;
}

function emailHtml(payload: EnquiryPayload, phone: string, notice?: string) {
  const rows = [
    ["Name", payload.name],
    ["Phone", phone],
    ["Service", payload.service],
    ["Locality", payload.locality || "Not provided"],
    ["Preferred time", payload.preferredTime || "Not provided"],
    ["Message", payload.message || "Not provided"],
  ];

  return `
    <div style="font-family: Georgia, serif; color: #1c1916; line-height: 1.5;">
      <h1 style="font-size: 20px; font-weight: 600;">New website enquiry</h1>
      <p style="margin: 0 0 16px;">MS Sofa Repair &amp; Furnishing</p>
      ${
        notice
          ? `<p style="padding: 12px; background: #f4ebe0; border: 1px solid #c4a574; border-radius: 8px;">${escapeHtml(notice)}</p>`
          : ""
      }
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding: 8px 12px; border: 1px solid #e8dfd0; width: 180px; font-family: Arial, sans-serif; font-size: 13px; color: #5c564e;">${label}</td>
                <td style="padding: 8px 12px; border: 1px solid #e8dfd0; white-space: pre-wrap;">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;
}

export async function handleEnquiry(
  body: unknown,
  meta: { ip: string; origin?: string },
): Promise<EnquiryResult> {
  const payload = parseBody(body);
  if (!payload) {
    return { status: 400, json: { ok: false, error: "Invalid request." } };
  }

  if (payload.website) {
    return { status: 200, json: { ok: true } };
  }

  if (isRateLimited(meta.ip)) {
    return {
      status: 429,
      json: { ok: false, error: "Too many enquiries from this connection. Please try again later." },
    };
  }

  const error = validate(payload);
  if (error) return { status: 400, json: { ok: false, error } };

  const apiKey = process.env.RESEND_API_KEY;
  const businessInbox = process.env.CONTACT_EMAIL || "mssofarepair9@gmail.com";
  const fromRaw = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  const from = fromRaw.includes("example.com") ? "onboarding@resend.dev" : fromRaw;
  const phone = normalizeIndianPhone(payload.phone) as string;
  const textBody = (notice?: string) =>
    [
      "New website enquiry — MS Sofa Repair & Furnishing",
      notice ? `Note: ${notice}` : "",
      `Name: ${payload.name}`,
      `Phone: ${phone}`,
      `Service: ${payload.service}`,
      `Locality: ${payload.locality || "Not provided"}`,
      `Preferred time: ${payload.preferredTime || "Not provided"}`,
      `Message: ${payload.message || "Not provided"}`,
    ]
      .filter(Boolean)
      .join("\n");

  // 1) Prefer FormSubmit directly to the business inbox.
  if (await sendViaFormSubmit(businessInbox, payload, phone)) {
    return { status: 200, json: { ok: true } };
  }

  // 2) Resend — may only allow the Resend account email until a domain is verified.
  if (apiKey) {
    const delivered = await sendViaResend({
      apiKey,
      from,
      to: businessInbox,
      payload,
      phone,
      textBody,
    });
    if (delivered) return { status: 200, json: { ok: true } };
  }

  return {
    status: 502,
    json: {
      ok: false,
      error: "We could not send your enquiry. Please try WhatsApp or call us directly.",
    },
  };
}

async function sendViaResend({
  apiKey,
  from,
  to,
  payload,
  phone,
  textBody,
}: {
  apiKey: string;
  from: string;
  to: string;
  payload: EnquiryPayload;
  phone: string;
  textBody: (notice?: string) => string;
}) {
  const resend = new Resend(apiKey);
  const subject = "New Website Enquiry — MS Sofa Repair & Furnishing";

  try {
    const first = await resend.emails.send({
      from,
      to,
      subject,
      html: emailHtml(payload, phone),
      text: textBody(),
    });

    if (!first.error) return true;

    console.error("Resend error:", first.error.message, "from=", from, "to=", to);

    const ownMatch = first.error.message.match(/your own email address \(([^)]+)\)/i);
    const fallbackTo =
      ownMatch?.[1] ||
      process.env.RESEND_ACCOUNT_EMAIL ||
      "info.abhisheksaroj@gmail.com";

    if (fallbackTo.toLowerCase() === to.toLowerCase()) return false;

    const notice = `Resend test mode cannot mail ${to} yet. Please forward this lead to ${to}.`;
    const second = await resend.emails.send({
      from,
      to: fallbackTo,
      subject: `${subject} → ${to}`,
      html: emailHtml(payload, phone, notice),
      text: textBody(notice),
    });

    if (!second.error) {
      console.info("Resend delivered via account inbox fallback:", fallbackTo);
      return true;
    }

    console.error("Resend fallback error:", second.error.message);
    return false;
  } catch (error) {
    console.error("Resend exception:", error);
    return false;
  }
}

async function sendViaFormSubmit(to: string, payload: EnquiryPayload, phone: string) {
  try {
    const body = new URLSearchParams({
      _subject: "New Website Enquiry — MS Sofa Repair & Furnishing",
      _template: "table",
      _captcha: "false",
      _honey: "",
      name: payload.name,
      phone,
      service: payload.service,
      locality: payload.locality || "Not provided",
      preferredTime: payload.preferredTime || "Not provided",
      message: payload.message || "Not provided",
    });

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const raw = await response.text();
    let data: { success?: string | boolean; message?: string } = {};
    try {
      data = JSON.parse(raw) as { success?: string | boolean; message?: string };
    } catch {
      const lower = raw.toLowerCase();
      if (
        response.ok &&
        (lower.includes("thank") ||
          lower.includes("activat") ||
          lower.includes("success") ||
          lower.includes("submitted"))
      ) {
        return true;
      }
      console.error("FormSubmit non-JSON response:", response.status, raw.slice(0, 180));
      return false;
    }

    const message = String(data.message || "");
    if (response.ok && (data.success === true || data.success === "true")) return true;
    if (response.ok && message.toLowerCase().includes("activation")) return true;
    console.error("FormSubmit error:", response.status, data.message || data);
    return false;
  } catch (error) {
    console.error("FormSubmit error:", error);
    return false;
  }
}
