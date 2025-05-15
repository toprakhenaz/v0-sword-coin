import type React from "react"
export interface User {
  id: number
  telegramId: number
  username: string
  firstName: string
  lastName?: string
  coins: number
  crystals: number
  energy: number
  energyMax: number
  league: number
  coinsPerTap: number
  coinsHourly: number
  dailyBoostCount: number
  lastBoostTime: string
  referrerId?: number
  createdAt: string
  lastLogin: string
}

export interface CardData {
  id: number
  name: string
  image: string
  level: number
  hourlyIncome: number
  crystals: number
  upgradeCost: number
  category: string
}

export interface SpecialOffer {
  id: number
  title: string
  reward: number
  link: string
  isClaimed?: boolean
}

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  allows_write_to_pm?: boolean
}

export interface AlertProps {
  children: React.ReactNode
  isGreen: boolean
}

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
  disabled?: boolean
}

export interface EarnCardProps {
  className?: string
  children: React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export interface ProgressProps {
  value: number
  className?: string
}

export interface BottomNavProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export interface FriendsProps {
  length: number
}

export interface RefferanceRowProps {
  referance: Referance
  collectCoins: (referencedId: number) => void
  isAnimating?: boolean
}

export interface CardProps {
  card: CardData
  onUpgrade: (cardId: number) => void
  coins: number
}

export interface ConfirmationPopupProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export interface TimerBarProps {
  dailyCombo: number[]
  foundCards: number[]
}

export interface Referance {
  id: number
  referrerId: number
  referredId: number
  referredName: string
  rewardAmount: number
  isClaimed: boolean
  previousLeague: number
  createdAt: string
}

export interface CentralButtonProps {
  onClick: () => void
  league: number
}

export interface CoinDisplayProps {
  coins: number
  league: number
  onclick: () => void
}

export interface EnergyBarProps {
  energy: number
  maxEnergy: number
  boost: () => void
}

export interface HeaderProps {
  earnPerTap: number
  coinsToLevelUp: number
  crystals: number
}

export interface LeagueOverlayProps {
  onClose: () => void
  coins: number
}
