type BrandLogoProps = {
  siteName?: string;
  variant?: "default" | "inverse";
  showTagline?: boolean;
};

function renderWordmark(siteName: string, inverse: boolean) {
  if (siteName.toLowerCase() !== "plantxchange") {
    return <span className="text-xl font-black uppercase tracking-tight">{siteName}</span>;
  }

  return (
    <span
      className={`text-xl font-black uppercase tracking-tight sm:text-2xl ${
        inverse ? "text-[#ff6a2a]" : "text-[#ff3d00]"
      }`}
    >
      <span>Plant</span>
      <span className={inverse ? "text-[#ff6a2a]" : "text-[#d83400]"}>X</span>
      <span>change</span>
    </span>
  );
}

export function BrandLogo({
  siteName = "PlantXchange",
  variant = "default",
  showTagline = true,
}: BrandLogoProps) {
  const inverse = variant === "inverse";

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md ${
          inverse
            ? "bg-white/10 text-[#ff6a2a]"
            : "bg-[#fff3ed] text-[#ff3d00]"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 44 44"
          className="relative h-7 w-7"
          fill="none"
        >
          <path
            d="M8 32V19l7 4v-7l8 4v-8h7v20"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 32h24M15 28h2.5M22 28h2.5M29 28h2.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="grid min-w-0 leading-none">
        {renderWordmark(siteName, inverse)}
        {showTagline ? (
          <span
            className={`mt-1 hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block ${
              inverse ? "text-white/54" : "text-[#6b6f75]"
            }`}
          >
            Heavy industry exchange
          </span>
        ) : null}
      </span>
    </span>
  );
}
