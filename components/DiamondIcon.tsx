import Image from "next/image"

export default function DiamondIcon({ size = 24 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image src="/crystal-hd.png" alt="Crystal" width={size} height={size} className="drop-shadow-lg" />
    </div>
  )
}
