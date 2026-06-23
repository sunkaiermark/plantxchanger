import { hasStrapiWriteConfig } from "@/lib/env";
import { validateInquiryInput } from "@/lib/inquiries/validation";
import { createInquiry } from "@/lib/strapi/inquiries";
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
    const inquiry = await createInquiry(parsed.data, {
      userAgent: request.headers.get("user-agent"),
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip"),
    });

    return NextResponse.json({ ok: true, inquiry });
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
