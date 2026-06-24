import { hasInquiryWriteConfig } from "@/lib/env";
import { isQuoteStatus, updateInquiryStatus } from "@/lib/strapi/inquiries";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const json = await request.json().catch(() => null);
  const status = typeof json?.status === "string" ? json.status : "";

  if (!isQuoteStatus(status)) {
    return NextResponse.json(
      { ok: false, message: "Unsupported quote status." },
      { status: 400 },
    );
  }

  if (!hasInquiryWriteConfig()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Inquiry database is not configured.",
      },
      { status: 502 },
    );
  }

  try {
    const { documentId } = await params;
    const inquiry = await updateInquiryStatus(documentId, status);
    return NextResponse.json({ ok: true, inquiry });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "We could not update the inquiry status.",
      },
      { status: 502 },
    );
  }
}
