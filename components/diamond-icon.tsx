interface DiamondIconProps {
  className?: string
  size?: number
  color?: string
  secondaryColor?: string
  highlightColor?: string
}

export default function DiamondIcon({
  className = "",
  size = 24,
  color = "#3b82f6", // Mavi
  secondaryColor = "#1d4ed8", // Koyu mavi
  highlightColor = "#ffffff", // Beyaz
}: DiamondIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ana elmas şekli */}
      <path d="M12 2L4 8L12 22L20 8L12 2Z" fill={color} stroke={secondaryColor} strokeWidth="0.5" />

      {/* Üst yüzey */}
      <path d="M12 2L4 8H20L12 2Z" fill={secondaryColor} stroke={secondaryColor} strokeWidth="0.5" />

      {/* Sol yüzey */}
      <path
        d="M4 8L12 22L12 8L4 8Z"
        fill={secondaryColor}
        fillOpacity="0.7"
        stroke={secondaryColor}
        strokeWidth="0.5"
      />

      {/* Işık yansıması */}
      <path d="M12 8L14 12L12 18L10 12L12 8Z" fill={highlightColor} fillOpacity="0.3" />

      {/* Parlama efekti */}
      <circle cx="10" cy="6" r="0.8" fill={highlightColor} fillOpacity="0.8" />

      {/* Keskin kenarlar */}
      <path d="M12 2L4 8L12 22L20 8L12 2Z" stroke={secondaryColor} strokeWidth="0.5" strokeLinejoin="bevel" />
    </svg>
  )
}
