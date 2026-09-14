export const SITE_BRAND_NAME = "PlantXchanger";

const legacyBrandPattern = /\bplant[\s_-]*xchange(?:r)?\b/gi;

export function canonicalizeBrandText(value: string): string {
  return value.replace(legacyBrandPattern, (match, offset, source: string) => {
    const previousCharacter = source[offset - 1];
    const nextCharacter = source[offset + match.length];
    const characterAfterNext = source[offset + match.length + 1];
    const startsDomainSuffix =
      nextCharacter === "." && Boolean(characterAfterNext?.match(/[a-z0-9]/i));

    if (
      previousCharacter === "@" ||
      previousCharacter === "/" ||
      previousCharacter === "." ||
      startsDomainSuffix
    ) {
      return match;
    }

    return SITE_BRAND_NAME;
  });
}

export function canonicalizeOptionalBrandText(value: string | undefined): string | undefined {
  return value === undefined ? undefined : canonicalizeBrandText(value);
}
