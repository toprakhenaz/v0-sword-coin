"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes, faUpload } from "@fortawesome/free-solid-svg-icons"
import { useSupabase } from "@/providers/SupabaseProvider"
import toast from "react-hot-toast"
import Image from "next/image"

export default function AdminLeagueModal({
  league,
  onClose,
  onSave,
}: {
  league: any
  onClose: () => void
  onSave: (leagueData: any) => void
}) {
  const { supabase } = useSupabase()
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    requiredCoins: 0,
    reward: 0,
    image: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (league) {
      setFormData({
        id: league.id,
        name: league.name,
        requiredCoins: league.requiredCoins,
        reward: league.reward,
        image: league.image,
      })
      setImagePreview(league.image)
    }
  }, [league])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number.parseInt(value) : value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!supabase || !imageFile) return formData.image

    try {
      setUploading(true)
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `leagues/${fileName}`

      const { error: uploadError } = await supabase.storage.from("sword-coin").upload(filePath, imageFile)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("sword-coin").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
      return formData.image
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalFormData = { ...formData }

    // Upload image if a new one was selected
    if (imageFile) {
      const imageUrl = await uploadImage()
      finalFormData.image = imageUrl
    }

    onSave(finalFormData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit League {formData.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">League Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Required Coins</label>
              <input
                type="number"
                name="requiredCoins"
                value={formData.requiredCoins}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Reward</label>
              <input
                type="number"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">League Image</label>
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20 bg-gray-700 rounded-md overflow-hidden">
                  {imagePreview ? (
                    <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <FontAwesomeIcon icon={faUpload} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-center">
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    {imageFile ? "Change Image" : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
