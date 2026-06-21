type BrandLogoProps = {
  siteName?: string;
  variant?: "default" | "inverse";
  showTagline?: boolean;
};

function renderWordmark(siteName: string, inverse: boolean) {
  if (siteName.toLowerCase() !== "plantxchange") {
    return <span className="text-xl font-black tracking-normal">{siteName}</span>;
  }

  return (
    <span
      className={`text-[1.55rem] font-black tracking-normal sm:text-[1.75rem] ${
        inverse ? "text-white" : "text-[#1f2328]"
      }`}
    >
      <span>Plant</span>
      <span className={inverse ? "text-[#ff8a4c]" : "text-[#ff3d00]"}>X</span>
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
    <span className="flex min-w-0 items-center gap-3">
      <span
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-sm ${
          inverse
            ? "border-white/12 bg-white/8 text-[#ff8a4c]"
            : "border-[#ffcab8] bg-[#202329] text-[#ff3d00]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-x-1 top-1 h-1 rounded-full ${
            inverse ? "bg-white/16" : "bg-white/10"
          }`}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          className="relative h-8 w-8"
          fill="none"
        >
          <path
            d="M7.5 35.5V22l7.7 4.6v-8.4l8.7 5.1V13h7.7l1.7 22.5"
            stroke={inverse ? "currentColor" : "#ff6a2a"}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 35.5h24"
            stroke={inverse ? "white" : "#f8fafc"}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M15.5 31h2.7M23 31h2.7M30.5 31h2.7"
            stroke={inverse ? "white" : "#f8fafc"}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M34 14.5l5 4.4-5 4.4M39 18.9H28.5M14 14.5l-5 4.4 5 4.4M9 18.9h10.5"
            stroke="currentColor"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="grid min-w-0 leading-none">
        {renderWordmark(siteName, inverse)}
        {showTagline ? (
          <span
            className={`mt-1 hidden text-[10px] font-black uppercase tracking-[0.16em] sm:block ${
              inverse ? "text-white/58" : "text-[#5f656d]"
            }`}
          >
            Used equipment marketplace
          </span>
        ) : null}
      </span>
    </span>
  );
}
