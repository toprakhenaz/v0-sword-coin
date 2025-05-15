"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type DeviceContextType = {
  isMobile: boolean
}

const DeviceContext = createContext<DeviceContextType>({
  isMobile: true,
})

export const useDeviceDetection = () => useContext(DeviceContext)

export const DeviceDetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent)
      setIsMobile(isMobileDevice || window.innerWidth < 1024)
    }

    checkDevice()
    window.addEventListener("resize", checkDevice)

    return () => {
      window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return <DeviceContext.Provider value={{ isMobile }}>{children}</DeviceContext.Provider>
}

// Add default export
export default DeviceDetectionProvider
