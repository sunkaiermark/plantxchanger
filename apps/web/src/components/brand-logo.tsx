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
    <span className="flex min-w-0 items-center">
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
