"use client"

import { useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSave, faClock } from "@fortawesome/free-solid-svg-icons"

export default function AdminSettings() {
  const { supabase } = useSupabase()
  const [listingDate, setListingDate] = useState("2026-01-01")
  const [listingTime, setListingTime] = useState("13:00")
  const [listingPrice, setListingPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      // In a real implementation, this would save to a settings table in the database
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast.success("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleDailyReset = async () => {
    if (!supabase) return

    if (
      !window.confirm(
        "Are you sure you want to perform a daily reset? This will reset all users' daily rewards and boosts.",
      )
    ) {
      return
    }

    setResetting(true)

    try {
      const response = await fetch("/api/daily-reset", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to perform daily reset")
      }

      toast.success("Daily reset performed successfully")
    } catch (error) {
      console.error("Error performing daily reset:", error)
      toast.error("Failed to perform daily reset")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Listing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Listing Date</label>
                <input
                  type="date"
                  value={listingDate}
                  onChange={(e) => setListingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Listing Time</label>
                <input
                  type="time"
                  value={listingTime}
                  onChange={(e) => setListingTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Listing Price (USD)</label>
                <input
                  type="text"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="?"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">System Maintenance</h2>
            <div className="space-y-4">
              <button
                onClick={handleDailyReset}
                disabled={resetting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                {resetting ? "Performing Reset..." : "Perform Daily Reset"}
              </button>
              <p className="text-sm text-gray-400">
                This will reset all users' daily rewards, boosts, and generate a new daily card combo.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}
