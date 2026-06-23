import type { InquiryInput } from "./validation";

export function buildInquiryCreatePayload(
  input: InquiryInput,
  meta: { userAgent?: string | null; ipAddress?: string | null },
) {
  return {
    data: {
      inquiryType: input.inquiryType,
      status: "pending",
      relatedEquipment: input.relatedEquipmentDocumentId,
      equipmentReferenceSnapshot: input.equipmentReferenceSnapshot,
      equipmentTitleSnapshot: input.equipmentTitleSnapshot,
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      country: input.country,
      message: input.message,
      sourcePage: input.sourcePage,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      userAgent: meta.userAgent ?? undefined,
      ipAddress: meta.ipAddress ?? undefined,
    },
  };
}
