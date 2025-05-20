// Card data and utility functions

export const getCardImage = (cardId: number): string => {
  // This is a placeholder function - replace with actual implementation
  return `/equipment/card-${cardId}.png`
}

export const cards: Record<string, any[]> = {
  Ekipman: [
    {
      id: 1,
      name: "Ahşap Kılıç",
      image: "/equipment/wooden-sword.png",
      level: 1,
      hourlyIncome: 10,
      upgradeCost: 100,
      description: "Basit bir ahşap kılıç. Başlangıç seviyesi için ideal.",
    },
    {
      id: 2,
      name: "Demir Kılıç",
      image: "/equipment/iron-sword.png",
      level: 2,
      hourlyIncome: 30,
      upgradeCost: 300,
      description: "Dayanıklı bir demir kılıç. Orta seviye maceralar için uygun.",
    },
    {
      id: 3,
      name: "Çelik Kılıç",
      image: "/equipment/steel-sword.png",
      level: 3,
      hourlyIncome: 100,
      upgradeCost: 1000,
      description: "Yüksek kaliteli çelik kılıç. Güçlü düşmanlarla savaşmak için ideal.",
    },
    {
      id: 10,
      name: "Ejderha Kılıcı",
      image: "/equipment/dragon-sword.png",
      level: 5,
      hourlyIncome: 500,
      upgradeCost: 5000,
      description: "Efsanevi ejderha kılıcı. En güçlü silahlardan biri.",
    },
  ],
  İşçiler: [
    {
      id: 4,
      name: "Acemi Savaşçı",
      image: "/novice-warrior.png",
      level: 1,
      hourlyIncome: 20,
      upgradeCost: 200,
      description: "Yeni başlayan bir savaşçı. Temel görevlerde yardımcı olur.",
    },
    {
      id: 5,
      name: "Tecrübeli Savaşçı",
      image: "/placeholder-rksqk.png",
      level: 2,
      hourlyIncome: 60,
      upgradeCost: 600,
      description: "Deneyimli bir savaşçı. Zorlu görevlerde size destek olur.",
    },
    {
      id: 11,
      name: "Şövalye",
      image: "/fantasy-knight.png",
      level: 3,
      hourlyIncome: 150,
      upgradeCost: 1500,
      description: "Eğitimli bir şövalye. Yüksek gelir sağlar ve güçlü düşmanlarla savaşabilir.",
    },
  ],
  Isekai: [
    {
      id: 6,
      name: "Büyülü Kristal",
      image: "/magic-crystal-fantasy.png",
      level: 1,
      hourlyIncome: 50,
      upgradeCost: 500,
      description: "Büyülü bir kristal. Pasif gelir sağlar ve büyü gücünüzü artırır.",
    },
    {
      id: 12,
      name: "Ruh Taşı",
      image: "/soul-stone-fantasy.png",
      level: 2,
      hourlyIncome: 120,
      upgradeCost: 1200,
      description: "Güçlü bir ruh taşı. Yüksek miktarda pasif gelir sağlar.",
    },
  ],
  Özel: [
    {
      id: 7,
      name: "Hazine Haritası",
      image: "/placeholder-hs0kc.png",
      level: 1,
      hourlyIncome: 40,
      upgradeCost: 400,
      description: "Gizli hazineleri gösteren bir harita. Ekstra gelir sağlar.",
    },
    {
      id: 13,
      name: "Altın Pusula",
      image: "/golden-compass-fantasy.png",
      level: 2,
      hourlyIncome: 90,
      upgradeCost: 900,
      description: "Nadir bir altın pusula. Değerli kaynakları bulmada yardımcı olur.",
    },
  ],
}
