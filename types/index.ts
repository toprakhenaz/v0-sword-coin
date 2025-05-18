import type React from "react"
// Common types for the application
import type { ReactNode } from "react"

// Card Component Types
export interface CardData {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  upgradeCost: number
}

export interface CardProps {
  card: CardData
  onUpgrade: (id: number) => void
  coins: number
}

// Confirmation Popup Types
export interface ConfirmationPopupProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

// Bottom Nav Types
export interface BottomNavProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

// Timer Bar Types
export interface TimerBarProps {
  dailyCombo: number[]
  foundCards: number[]
}

// Coin Display Types
export interface CoinDisplayProps {
  coins: number
  league: number
  onclick: () => void
}

// Header Types
export interface HeaderProps {
  earnPerTap: number
  coinsToLevelUp: number
  crystals: number
}

// Central Button Types
export interface CentralButtonProps {
  onClick: () => void
  league: number
}

// League Overlay Types
export interface LeagueOverlayProps {
  onClose: () => void
  coins: number
}

// Energy Bar Types
export interface EnergyBarProps {
  energy: number
  maxEnergy: number
  boost: () => void
}

// Referance Row Types
export interface RefferanceRowProps {
  referance: {
    id: number
    referencedId: number
    referancedName: string
    referenceAmount: number
    isClaimed: boolean
  }
  collectCoins: (id: number) => void
  isAnimating?: boolean
}

// Friends Component Types
export interface FriendsProps {
  length: number
}

// Progress Component Types
export interface ProgressProps {
  value: number
  className?: string
}

// Modal Component Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

// Button Component Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: ReactNode
  disabled?: boolean
}

// Alert Component Types
export interface AlertProps {
  children: ReactNode
  isGreen?: boolean
}

// EarnCard Component Types
export interface EarnCardProps {
  className?: string
  children?: ReactNode
}
