"use server"

import { createServerClient } from "./supabase"

export async function seedDailyRewards() {
  const supabase = createServerClient()

  // Check if daily rewards already exist
  const { data: existingRewards } = await supabase.from("daily_rewards").select("id").limit(1)

  if (existingRewards && existingRewards.length > 0) {
    console.log("Daily rewards already seeded")
    return
  }

  // Seed daily rewards
  const dailyRewards = [
    { day: 1, reward: 100 },
    { day: 2, reward: 200 },
    { day: 3, reward: 300 },
    { day: 4, reward: 400 },
    { day: 5, reward: 500 },
    { day: 6, reward: 600 },
    { day: 7, reward: 2000 },
  ]

  const { error } = await supabase.from("daily_rewards").insert(dailyRewards)

  if (error) {
    console.error("Error seeding daily rewards:", error)
  } else {
    console.log("Daily rewards seeded successfully")
  }
}

export async function seedItems() {
  const supabase = createServerClient()

  // Check if items already exist
  const { data: existingItems } = await supabase.from("items").select("id").limit(1)

  if (existingItems && existingItems.length > 0) {
    console.log("Items already seeded")
    return
  }

  // Seed items
  const items = [
    {
      name: "Ahşap Kılıç",
      category: "Ekipman",
      image: "/wooden-fantasy-sword.png",
      base_hourly_income: 10,
      base_upgrade_cost: 100,
      description: "Basit bir ahşap kılıç. Başlangıç seviyesi için ideal.",
    },
    {
      name: "Demir Kılıç",
      category: "Ekipman",
      image: "/iron-fantasy-sword.png",
      base_hourly_income: 30,
      base_upgrade_cost: 300,
      description: "Dayanıklı bir demir kılıç. Orta seviye maceralar için uygun.",
    },
    {
      name: "Çelik Kılıç",
      category: "Ekipman",
      image: "/placeholder-zrrmy.png",
      base_hourly_income: 100,
      base_upgrade_cost: 1000,
      description: "Yüksek kaliteli çelik kılıç. Güçlü düşmanlarla savaşmak için ideal.",
    },
    {
      name: "Ejderha Kılıcı",
      category: "Ekipman",
      image: "/placeholder-j0tzm.png",
      base_hourly_income: 500,
      base_upgrade_cost: 5000,
      description: "Efsanevi ejderha kılıcı. En güçlü silahlardan biri.",
    },
    {
      name: "Acemi Savaşçı",
      category: "İşçiler",
      image: "/novice-warrior.png",
      base_hourly_income: 20,
      base_upgrade_cost: 200,
      description: "Yeni başlayan bir savaşçı. Temel görevlerde yardımcı olur.",
    },
    {
      name: "Tecrübeli Savaşçı",
      category: "İşçiler",
      image: "/placeholder-e3etl.png",
      base_hourly_income: 60,
      base_upgrade_cost: 600,
      description: "Deneyimli bir savaşçı. Zorlu görevlerde size destek olur.",
    },
    {
      name: "Şövalye",
      category: "İşçiler",
      image: "/fantasy-knight.png",
      base_hourly_income: 150,
      base_upgrade_cost: 1500,
      description: "Eğitimli bir şövalye. Yüksek gelir sağlar ve güçlü düşmanlarla savaşabilir.",
    },
    {
      name: "Büyülü Kristal",
      category: "Isekai",
      image: "/magic-crystal-fantasy.png",
      base_hourly_income: 50,
      base_upgrade_cost: 500,
      description: "Büyülü bir kristal. Pasif gelir sağlar ve büyü gücünüzü artırır.",
    },
    {
      name: "Ruh Taşı",
      category: "Isekai",
      image: "/placeholder.svg?height=200&width=200&query=soul+stone+fantasy",
      base_hourly_income: 120,
      base_upgrade_cost: 1200,
      description: "Güçlü bir ruh taşı. Yüksek miktarda pasif gelir sağlar.",
    },
    {
      name: "Hazine Haritası",
      category: "Özel",
      image: "/placeholder.svg?height=200&width=200&query=treasure+map+fantasy",
      base_hourly_income: 40,
      base_upgrade_cost: 400,
      description: "Gizli hazineleri gösteren bir harita. Ekstra gelir sağlar.",
    },
    {
      name: "Altın Pusula",
      category: "Özel",
      image: "/placeholder.svg?height=200&width=200&query=golden+compass+fantasy",
      base_hourly_income: 90,
      base_upgrade_cost: 900,
      description: "Nadir bir altın pusula. Değerli kaynakları bulmada yardımcı olur.",
    },
  ]

  const { error } = await supabase.from("items").insert(items)

  if (error) {
    console.error("Error seeding items:", error)
  } else {
    console.log("Items seeded successfully")
  }
}

export async function seedTasks() {
  const supabase = createServerClient()

  // Check if tasks already exist
  const { data: existingTasks } = await supabase.from("tasks").select("id").limit(1)

  if (existingTasks && existingTasks.length > 0) {
    console.log("Tasks already seeded")
    return
  }

  // Seed tasks
  const tasks = [
    {
      title: "Bitcoin Haberleri",
      description: "En son Bitcoin haberlerini oku",
      reward: 500,
      category: "Crypto",
    },
    {
      title: "Ethereum Anketi",
      description: "Ethereum hakkında anketi doldur",
      reward: 1000,
      category: "Crypto",
    },
    {
      title: "Kripto Eğitimi",
      description: "Kripto para eğitim videosunu izle",
      reward: 1500,
      category: "Crypto",
    },
    {
      title: "Banka Hesabı",
      description: "Banka hesabını doğrula",
      reward: 2000,
      category: "Banka",
    },
    {
      title: "Sponsor Videosu",
      description: "Sponsor videosunu izle",
      reward: 800,
      category: "Sponsor",
    },
    {
      title: "Reklam İzle",
      description: "Günlük reklamı izle",
      reward: 300,
      category: "Reklam",
    },
  ]

  const { error } = await supabase.from("tasks").insert(tasks)

  if (error) {
    console.error("Error seeding tasks:", error)
  } else {
    console.log("Tasks seeded successfully")
  }
}

export async function seedDatabase() {
  await seedDailyRewards()
  await seedItems()
  await seedTasks()

  return { success: true }
}
