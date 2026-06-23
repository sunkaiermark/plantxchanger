interface EquipmentContactContext {
  reference: string;
  title: string;
  slug: string;
}

export function buildEquipmentMessage(equipment: EquipmentContactContext): string {
  return [
    "Hello PlantXchange,",
    "",
    "I am interested in this equipment:",
    `Reference: ${equipment.reference}`,
    `Title: ${equipment.title}`,
    `Page: /equipment/${equipment.slug}`,
    "",
    "Please send availability, inspection details, and current quote information.",
  ].join("\n");
}

export function buildEquipmentEmailHref(
  equipment: EquipmentContactContext,
  email: string,
): string {
  const subject = `Inquiry for ${equipment.reference} - ${equipment.title}`;
  const body = buildEquipmentMessage(equipment);
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildEquipmentWhatsAppHref(
  equipment: EquipmentContactContext,
  whatsappNumber: string,
): string {
  const phone = whatsappNumber.replace(/\D/g, "");
  const text = buildEquipmentMessage(equipment);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
