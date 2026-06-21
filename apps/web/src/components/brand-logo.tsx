type BrandLogoProps = {
  siteName?: string;
  variant?: "default" | "inverse";
  showTagline?: boolean;
};

function renderWordmark(siteName: string, inverse: boolean) {
  if (siteName.toLowerCase() !== "plantxchange") {
    return <span className="text-lg font-semibold tracking-normal">{siteName}</span>;
  }

  return (
    <span className="text-xl font-bold tracking-normal sm:text-2xl">
      <span className={inverse ? "text-white" : "text-[#18211f]"}>Plant</span>
      <span className="text-[#b7791f]">X</span>
      <span className={inverse ? "text-white" : "text-[#17463a]"}>change</span>
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
    <span className="flex min-w-0 items-center gap-3">
      <span
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ring-1 ${
          inverse
            ? "bg-white text-[#17463a] ring-white/20"
            : "bg-[#17463a] text-white ring-[#12372e]/10"
        }`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(241,198,109,0.55),transparent_38%)]" />
        <svg
          aria-hidden="true"
          viewBox="0 0 44 44"
          className="relative h-9 w-9"
          fill="none"
        >
          <path
            d="M11 29.5V12h8.2c4.3 0 7.2 2.5 7.2 6.1 0 3.8-2.9 6.3-7.2 6.3h-3.1v5.1"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25.5 13.5 34 30.5M34 13.5 25.5 30.5"
            stroke={inverse ? "#b7791f" : "#f1c66d"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M15.5 24.2c5.6-.4 9.8-4 11.6-9.8"
            stroke={inverse ? "#17463a" : "#ffffff"}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.78"
          />
        </svg>
      </span>
      <span className="grid min-w-0 leading-none">
        {renderWordmark(siteName, inverse)}
        {showTagline ? (
          <span
            className={`mt-1 hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:block ${
              inverse ? "text-white/58" : "text-[#66736d]"
            }`}
          >
            Used process equipment
          </span>
        ) : null}
      </span>
    </span>
  );
}
