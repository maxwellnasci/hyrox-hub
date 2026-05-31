import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizes = {
  sm: { icon: "h-7 w-7 rounded-md", text: "text-lg" },
  md: { icon: "h-8 w-8 rounded-lg", text: "text-2xl" },
  lg: { icon: "h-10 w-10 rounded-xl", text: "text-3xl" },
};

export function BrandLogo({ className, size = "md", showText = true }: BrandLogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div
        className={cn(s.icon, "bg-primary shadow-[0_0_24px_-4px_oklch(0.72_0.2_40_/_0.6)]")}
        aria-hidden
      />
      {showText && (
        <span className={cn("font-display font-bold tracking-tight", s.text)}>HYROX</span>
      )}
    </div>
  );
}
