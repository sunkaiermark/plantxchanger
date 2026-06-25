export function linesToList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(values: string[] | undefined): string {
  return values?.join("\n") ?? "";
}

export function specsToText(specs: Array<{ label: string; value: string }> | undefined): string {
  return specs?.map((spec) => `${spec.label}=${spec.value}`).join("\n") ?? "";
}

export function textToSpecs(value: string): Array<{ label: string; value: string }> {
  return linesToList(value)
    .map((line) => {
      const [label, ...valueParts] = line.split("=");
      return { label: label.trim(), value: valueParts.join("=").trim() };
    })
    .filter((spec) => spec.label && spec.value);
}

export function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function optionalString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
