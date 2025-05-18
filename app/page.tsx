"use client"

import { useState, useEffect } from "react"
import HeaderCard from "@/components/HeaderCard"
import Navbar from "@/components/Navbar"
import CentralButton from "@/components/CentralButton"
import EnergyBar from "@/components/EnergyBar"
import CountdownTimer from "@/components/CountdownTimer"
import { useUser } from "./context/UserContext"
import MainPageSkeletonLoading from "@/components/skeletons/SkeletonMain"

export default function Home() {
  const { user, loading } = useUser()
  const [listingPrice, setListingPrice] = useState<string | null>(null)

  // Target date for listing: January 1, 2026 at 13:00
  const targetDate = new Date("2026-01-01T13:00:00")

  useEffect(() => {
    // In a real app, you would fetch the listing price from an API
    // For now, we'll leave it as null (showing "?")
    // This could be updated by an admin later
  }, [])

  if (loading || !user) {
    return <MainPageSkeletonLoading />
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 pb-24">
      <HeaderCard />

      <div className="my-6">
        <CountdownTimer targetDate={targetDate} title="Listing Countdown" price={listingPrice} />
      </div>

      <div className="my-6">
        <EnergyBar />
      </div>

      <div className="my-8">
        <CentralButton />
      </div>

      <Navbar />
    </main>
  )
}
