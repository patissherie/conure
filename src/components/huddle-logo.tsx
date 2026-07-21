const PETALS = [
  { angle: 0, fill: "var(--coral)" },
  { angle: 72, fill: "var(--honey)" },
  { angle: 144, fill: "#8FA76A" },
  { angle: 216, fill: "var(--umber)" },
  { angle: 288, fill: "#E38C74" },
]

export function HuddleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Huddle logo"
    >
      {/* Bird's-eye "team huddle": rounded bodies leaning into a center point */}
      {PETALS.map((petal) => (
        <ellipse
          key={petal.angle}
          cx="24"
          cy="12.5"
          rx="6"
          ry="8.5"
          fill={petal.fill}
          transform={`rotate(${petal.angle} 24 24) rotate(18 24 12.5)`}
        />
      ))}
    </svg>
  )
}
