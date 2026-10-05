import { motion } from "framer-motion";

/**
 * FinTrackBuddy Logo
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * showText: boolean (default true)
 */
export const Logo = ({ size = "md", showText = true }) => {
  const sizes = {
    sm: {
      box: "w-10 h-10",
      icon: "w-5 h-5",
      title: "text-base",
      sub: "text-[10px]",
    },
    md: { box: "w-12 h-12", icon: "w-6 h-6", title: "text-lg", sub: "text-xs" },
    lg: {
      box: "w-16 h-16",
      icon: "w-8 h-8",
      title: "text-2xl",
      sub: "text-sm",
    },
    xl: {
      box: "w-20 h-20",
      icon: "w-11 h-11",
      title: "text-4xl",
      sub: "text-sm",
    },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Icon Box */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={`${s.box} relative rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden flex-shrink-0`}
        style={{
          background:
            "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
          boxShadow:
            "0 10px 30px -5px rgba(59, 130, 246, 0.5), 0 8px 16px -8px rgba(139, 92, 246, 0.4)",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
          }}
        />

        {/* Shine */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-2xl" />

        {/* Chart Icon (custom) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`${s.icon} relative z-10`}
        >
          {/* Rising bars */}
          <rect
            x="3"
            y="14"
            width="3"
            height="7"
            rx="0.5"
            fill="white"
            opacity="0.9"
          />
          <rect
            x="9"
            y="10"
            width="3"
            height="11"
            rx="0.5"
            fill="white"
            opacity="0.95"
          />
          <rect x="15" y="6" width="3" height="15" rx="0.5" fill="white" />
          {/* Arrow line */}
          <path
            d="M3 16 L9 11 L15 13 L21 6"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
          />
          <path d="M17 6 L21 6 L21 10" stroke="white" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Text */}
      {showText && (
        <div className="min-w-0">
          <h1
            className={`${s.title} font-bold tracking-tight`}
            style={{
              background:
                "linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FinTrackBuddy
          </h1>
          <p className={`${s.sub} text-muted-foreground font-medium`}>
            Premium Finance
          </p>
        </div>
      )}
    </div>
  );
};
