export function LogoMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="40" height="40" rx="11" fill="#0f172a" />

      {/* Subtle top-left glow */}
      <circle cx="6" cy="6" r="14" fill="#2563eb" fillOpacity="0.35" />

      {/* Outer hexagonal ring — research/structure */}
      <path
        d="M20 6L31.5 12.5V25.5L20 32L8.5 25.5V12.5L20 6Z"
        stroke="#2563eb"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />

      {/* Inner bold diamond — the focus/lens */}
      <path
        d="M20 11L27 20L20 29L13 20L20 11Z"
        fill="#2563eb"
        fillOpacity="0.15"
        stroke="#2563eb"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Center spark — the insight point */}
      <circle cx="20" cy="20" r="3" fill="#2563eb" />
      <circle cx="20" cy="20" r="1.4" fill="white" />

      {/* Cross hair — four short rays */}
      <path d="M20 14.5V16.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 23.5V25.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 20H16.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23.5 20H25.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LogoWordmark({ size = 32, className = "", tone = "dark" }) {
  const wordColor = tone === "light" ? "#dae2fd" : "#0f172a";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span
        style={{
          fontFamily: "var(--font-display, 'Sora', system-ui, sans-serif)",
          fontWeight: 800,
          fontSize: size * 0.65 + "px",
          letterSpacing: "-0.03em",
          color: wordColor,
          lineHeight: 1,
        }}
      >
        Arxio
      </span>
    </span>
  );
}
