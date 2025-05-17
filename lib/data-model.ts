// Player model
export interface Player {
  id: string
  level: number
  currentXp: number
  totalXp: number
  coins: number
  stats: PlayerStats
  inventory: Inventory
  quests: Quest[]
  dailyStreak: number
  lastClaimDate: string | null
  lastPlayTime: number
}

export interface PlayerStats {
  strength: number
  defense: number
  agility: number
  vitality: number
}

// Weapon model
export interface Weapon {
  id: string
  name: string
  level: number
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  baseDamage: number
  criticalChance: number
  skills: Skill[]
}

export interface Skill {
  id: string
  name: string
  description: string
  cooldown: number
  isActive: boolean
  unlockLevel: number
}

// Inventory model
export interface Inventory {
  weapons: Weapon[]
  items: Item[]
  equippedWeaponId: string | null
}

export interface Item {
  id: string
  name: string
  type: "potion" | "material" | "special"
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  description: string
  effect?: string
  quantity: number
}

// Quest model
export interface Quest {
  id: string
  name: string
  description: string
  level: number
  difficulty: "easy" | "medium" | "hard" | "boss"
  duration: number
  timeRemaining: number
  rewards: QuestRewards
  isActive: boolean
  isCompleted: boolean
}

export interface QuestRewards {
  xp: number
  coins: number
  lootChance: number
  loot?: Item
}

// Daily system model
export interface DailySystem {
  streak: number
  lastClaimDate: string | null
  tasks: DailyTask[]
}

export interface DailyTask {
  id: number
  name: string
  progress: number
  target: number
  completed: boolean
}

// Game state model
export interface GameState {
  player: Player
  weapon: Weapon
  dailySystem: DailySystem
  settings: GameSettings
  version: string
}

export interface GameSettings {
  soundEnabled: boolean
  vibrationEnabled: boolean
  notificationsEnabled: boolean
}

// Cache and offline support
export interface OfflineProgress {
  xpGained: number
  coinsGained: number
  completedQuests: Quest[]
  loot: Item[]
}
