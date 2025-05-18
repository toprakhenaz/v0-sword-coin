"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faCoins, faImage, faTasks, faUserFriends, faTrophy, faBan } from "@fortawesome/free-solid-svg-icons"

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("cards")
  const [cards, setCards] = useState([])
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [listingPrice, setListingPrice] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase.from("admin_users").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setIsAdmin(!!data)
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [supabase])

  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      try {
        if (activeTab === "cards") {
          const { data, error } = await supabase.from("cards").select("*").order("id")
          if (error) throw error
          setCards(data)
        } else if (activeTab === "users") {
          const { data, error } = await supabase.from("users").select("*").order("id")
          if (error) throw error
          setUsers(data)
        } else if (activeTab === "tasks") {
          const { data, error } = await supabase.from("tasks").select("*").order("id")
          if (error) throw error
          setTasks(data)
        } else if (activeTab === "listing") {
          // Fetch listing price from settings table
          const { data, error } = await supabase.from("settings").select("*").eq("key", "listing_price").single()
          if (error && error.code !== "PGRST116") throw error
          setListingPrice(data?.value || "")
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error)
        toast({
          title: "Error",
          description: `Failed to fetch ${activeTab}`,
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [isAdmin, activeTab, supabase])

  const updateListingPrice = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .upsert({ key: "listing_price", value: listingPrice })
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Listing price updated successfully",
      })
    } catch (error) {
      console.error("Error updating listing price:", error)
      toast({
        title: "Error",
        description: "Failed to update listing price",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access the admin panel.</p>
          <a href="/" className="inline-block px-4 py-2 bg-blue-600 rounded-lg">
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <div className="flex overflow-x-auto mb-6 pb-2">
          <TabButton
            active={activeTab === "cards"}
            onClick={() => setActiveTab("cards")}
            icon={faImage}
            label="Cards"
          />
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={faUsers}
            label="Users"
          />
          <TabButton
            active={activeTab === "tasks"}
            onClick={() => setActiveTab("tasks")}
            icon={faTasks}
            label="Tasks"
          />
          <TabButton
            active={activeTab === "referrals"}
            onClick={() => setActiveTab("referrals")}
            icon={faUserFriends}
            label="Referrals"
          />
          <TabButton
            active={activeTab === "leagues"}
            onClick={() => setActiveTab("leagues")}
            icon={faTrophy}
            label="Leagues"
          />
          <TabButton active={activeTab === "bans"} onClick={() => setActiveTab("bans")} icon={faBan} label="Bans" />
          <TabButton
            active={activeTab === "listing"}
            onClick={() => setActiveTab("listing")}
            icon={faCoins}
            label="Listing"
          />
        </div>

        {activeTab === "cards" && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Manage Cards</h2>
              <button className="px-4 py-2 bg-green-600 rounded-lg">Add New Card</button>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Base Income</th>
                    <th className="p-3 text-left">Upgrade Cost</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id} className="border-t border-gray-700">
                      <td className="p-3">{card.id}</td>
                      <td className="p-3">{card.name}</td>
                      <td className="p-3">{card.category}</td>
                      <td className="p-3">{card.base_income}</td>
                      <td className="p-3">{card.upgrade_cost}</td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-blue-600 rounded-lg mr-2">Edit</button>
                        <button className="px-3 py-1 bg-red-600 rounded-lg">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Username</th>
                    <th className="p-3 text-left">Coins</th>
                    <th className="p-3 text-left">Crystals</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="p-3">{user.id}</td>
                      <td className="p-3">{user.username}</td>
                      <td className="p-3">{user.coins}</td>
                      <td className="p-3">{user.crystals}</td>
                      <td className="p-3">
                        <button className="px-3 py-1 bg-blue-600 rounded-lg mr-2">Edit</button>
                        <button className="px-3 py-1 bg-red-600 rounded-lg">Ban</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "listing" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Listing Settings</h2>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Listing Price (USD)</label>
                <div className="flex">
                  <input
                    type="text"
                    value={listingPrice}
                    onChange={(e) => setListingPrice(e.target.value)}
                    className="bg-gray-700 rounded-lg p-2 w-full"
                    placeholder="Enter listing price"
                  />
                  <button className="ml-2 px-4 py-2 bg-blue-600 rounded-lg" onClick={updateListingPrice}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented here */}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg mr-2 flex items-center ${
        active ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
      }`}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} className="mr-2" />
      {label}
    </button>
  )
}
