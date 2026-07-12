import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className,
}: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon: Book + Recycling + Graduation */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Book base */}
        <rect
          x="8"
          y="10"
          width="32"
          height="28"
          rx="3"
          fill="#1e3395"
        />
        <rect
          x="10"
          y="12"
          width="28"
          height="24"
          rx="2"
          fill="#2b44b8"
        />
        {/* Book spine */}
        <rect x="23" y="10" width="2" height="28" fill="#162670" />
        {/* Pages */}
        <rect x="12" y="14" width="10" height="2" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="12" y="18" width="8" height="1.5" rx="0.75" fill="#ffffff" opacity="0.4" />
        <rect x="12" y="21" width="9" height="1.5" rx="0.75" fill="#ffffff" opacity="0.4" />
        <rect x="26" y="14" width="10" height="2" rx="1" fill="#ffffff" opacity="0.6" />
        <rect x="26" y="18" width="8" height="1.5" rx="0.75" fill="#ffffff" opacity="0.4" />
        <rect x="26" y="21" width="9" height="1.5" rx="0.75" fill="#ffffff" opacity="0.4" />

        {/* Recycling arrows circle */}
        <circle cx="36" cy="12" r="10" fill="#f59300" />
        <path
          d="M32 8.5l2.5 2.5-2.5 2.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34.5 11c-2.5 0-4.5 2-4.5 4.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M40 15.5l-2.5-2.5 2.5-2.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M37.5 13c2.5 0 4.5-2 4.5-4.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Small graduation cap */}
        <polygon points="36,5 32,8 40,8" fill="white" />
        <rect x="35" y="3" width="2" height="3" rx="0.5" fill="white" />
      </svg>

      {showText && (
        <span
          className={cn(
            "font-black tracking-tight text-navy-800",
            s.text
          )}
        >
          کنکور<span className="text-accent-500">باز</span>
        </span>
      )}
    </div>
  );
}
