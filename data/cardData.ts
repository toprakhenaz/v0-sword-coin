import type { CardData } from "@/types"

export const Cards: CardData[] = [
  {
    id: 1,
    name: "Demir Kılıç",
    image: "/cards/iron-sword.png",
    level: 1,
    hourlyIncome: 10,
    crystals: 5,
    upgradeCost: 100,
    category: "Ekipman",
  },
  {
    id: 2,
    name: "Çelik Kılıç",
    image: "/cards/steel-sword.png",
    level: 1,
    hourlyIncome: 25,
    crystals: 10,
    upgradeCost: 250,
    category: "Ekipman",
  },
  {
    id: 3,
    name: "Altın Kılıç",
    image: "/cards/gold-sword.png",
    level: 1,
    hourlyIncome: 60,
    crystals: 20,
    upgradeCost: 600,
    category: "Ekipman",
  },
  {
    id: 4,
    name: "Madenci",
    image: "/cards/miner.png",
    level: 1,
    hourlyIncome: 15,
    crystals: 8,
    upgradeCost: 150,
    category: "İşçiler",
  },
  {
    id: 5,
    name: "Demirci",
    image: "/cards/blacksmith.png",
    level: 1,
    hourlyIncome: 35,
    crystals: 15,
    upgradeCost: 350,
    category: "İşçiler",
  },
  {
    id: 6,
    name: "Büyücü",
    image: "/cards/wizard.png",
    level: 1,
    hourlyIncome: 80,
    crystals: 25,
    upgradeCost: 800,
    category: "İşçiler",
  },
  {
    id: 7,
    name: "Ejderha",
    image: "/cards/dragon.png",
    level: 1,
    hourlyIncome: 150,
    crystals: 40,
    upgradeCost: 1500,
    category: "Isekai",
  },
  {
    id: 8,
    name: "Goblin",
    image: "/cards/goblin.png",
    level: 1,
    hourlyIncome: 30,
    crystals: 12,
    upgradeCost: 300,
    category: "Isekai",
  },
]

export function getCardImage(cardId: number): string {
  const card = Cards.find((card) => card.id === cardId)
  return card ? card.image : "/placeholder.png"
}
