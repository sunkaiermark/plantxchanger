import { hasStrapiWriteConfig } from "@/lib/env";
import { buildInquiryCreatePayload } from "@/lib/inquiries/payload";
import { validateInquiryInput } from "@/lib/inquiries/validation";
import { strapiFetch } from "@/lib/strapi/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = validateInquiryInput(json);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please check the inquiry form and try again." },
      { status: 400 },
    );
  }

  if (!hasStrapiWriteConfig()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Inquiry database is not configured. Please contact us by email or WhatsApp.",
      },
      { status: 502 },
    );
  }

  try {
    await strapiFetch("/api/inquiries", {
      mode: "write",
      init: {
        method: "POST",
        body: JSON.stringify(
          buildInquiryCreatePayload(parsed.data, {
            userAgent: request.headers.get("user-agent"),
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
              request.headers.get("x-real-ip"),
          }),
        ),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "We could not save the inquiry. Please contact us by email or WhatsApp.",
      },
      { status: 502 },
    );
  }
}
