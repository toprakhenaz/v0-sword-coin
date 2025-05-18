// Card data and utility functions

export const getCardImage = (cardId: number): string => {
  // This is a placeholder function - replace with actual implementation
  return `/cards/card-${cardId}.png`
}

export const cards: Record<string, any[]> = {
  Ekipman: [
    {
      id: 1,
      name: "Basit Kazma",
      image: "/cards/pickaxe-1.png",
      level: 1,
      hourlyIncome: 10,
      upgradeCost: 100,
    },
    {
      id: 2,
      name: "Demir Kazma",
      image: "/cards/pickaxe-2.png",
      level: 2,
      hourlyIncome: 30,
      upgradeCost: 300,
    },
    {
      id: 3,
      name: "Çelik Kazma",
      image: "/cards/pickaxe-3.png",
      level: 3,
      hourlyIncome: 100,
      upgradeCost: 1000,
    },
  ],
  İşçiler: [
    {
      id: 4,
      name: "Acemi Madenci",
      image: "/cards/miner-1.png",
      level: 1,
      hourlyIncome: 20,
      upgradeCost: 200,
    },
    {
      id: 5,
      name: "Tecrübeli Madenci",
      image: "/cards/miner-2.png",
      level: 2,
      hourlyIncome: 60,
      upgradeCost: 600,
    },
  ],
  Isekai: [
    {
      id: 6,
      name: "Büyülü Kristal",
      image: "/cards/crystal-1.png",
      level: 1,
      hourlyIncome: 50,
      upgradeCost: 500,
    },
  ],
  Özel: [
    {
      id: 7,
      name: "Altın Dedektörü",
      image: "/cards/detector-1.png",
      level: 1,
      hourlyIncome: 40,
      upgradeCost: 400,
    },
  ],
}
