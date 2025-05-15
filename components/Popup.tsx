"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

interface PopupProps {
  title: string
  message: string
  image: string
  onClose: () => void
}

export default function Popup({ title, message, image, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Animation for entrance
  useEffect(() => {
    // Slight delay before showing for smoother animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    // ESC key functionality
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose()
      }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
      window.removeEventListener("keydown", handleEsc)
      clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    // Delay the actual close to allow animation to complete
    setTimeout(onClose, 300)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-all duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl relative w-[90%] max-w-sm text-center border border-gray-700 transform transition-transform duration-300"
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.9)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-300 text-gray-300 hover:text-white"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="mb-2 mx-auto w-20 h-1 bg-gray-700 rounded-full"></div>

        <h2 className="text-2xl font-bold mb-3 text-white">{title}</h2>
        <p className="mb-4 text-gray-200">{message}</p>

        <div className="relative mb-5 p-2">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl animate-pulse"></div>
          <Image
            src={image || "/placeholder.png"}
            alt="Popup Image"
            width={128}
            height={128}
            className="mx-auto object-contain relative z-10 animate-bounce-slow"
            style={{ animationDuration: "3s" }}
          />
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 active:translate-y-0"
        >
          OK
        </button>
      </div>
    </div>
  )
}
