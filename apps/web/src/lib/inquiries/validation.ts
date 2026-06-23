import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const inquirySchema = z
  .object({
    inquiryType: z.enum(["buyer", "seller"]),
    relatedEquipmentDocumentId: z.preprocess(emptyToUndefined, z.string().optional()),
    equipmentReferenceSnapshot: z.preprocess(emptyToUndefined, z.string().optional()),
    equipmentTitleSnapshot: z.preprocess(emptyToUndefined, z.string().optional()),
    name: z.string().trim().min(1).max(120),
    company: z.preprocess(emptyToUndefined, z.string().trim().max(160).optional()),
    email: z.preprocess(emptyToUndefined, z.string().trim().email().optional()),
    phone: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    whatsapp: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    country: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
    message: z.string().trim().min(3).max(2000),
    sourcePage: z.preprocess(emptyToUndefined, z.string().trim().max(240).optional()),
    utmSource: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
    utmMedium: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
    utmCampaign: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
    website: z.string().optional(),
  })
  .superRefine((value, context) => {
    if (value.website && value.website.trim() !== "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid submission",
        path: ["website"],
      });
    }

    const hasContact = Boolean(value.email || value.phone || value.whatsapp);
    if (!hasContact) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide email, phone, or WhatsApp",
        path: ["email"],
      });
    }
  });

export type InquiryInput = z.infer<typeof inquirySchema>;

export function validateInquiryInput(input: unknown) {
  return inquirySchema.safeParse(input);
}
