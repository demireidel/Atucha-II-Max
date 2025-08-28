"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { useNuclearStore } from "@/lib/store"

export function TouchControls() {
  const { camera, gl } = useThree()
  const { tourActive } = useNuclearStore()
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (tourActive) return

    const canvas = gl.domElement
    let isRotating = false
    let isZooming = false
    let lastDistance = 0

    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault()

      if (event.touches.length === 1) {
        // Single touch - rotation
        const touch = event.touches[0]
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        }
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
        isRotating = true
      } else if (event.touches.length === 2) {
        // Two finger touch - zoom
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2),
        )
        lastDistance = distance
        isZooming = true
        isRotating = false
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault()

      if (isRotating && event.touches.length === 1 && lastTouchRef.current) {
        const touch = event.touches[0]
        const deltaX = touch.clientX - lastTouchRef.current.x
        const deltaY = touch.clientY - lastTouchRef.current.y

        // Rotate camera around target
        const spherical = camera.position.clone()
        const radius = spherical.length()

        // Horizontal rotation (azimuth)
        const azimuth = Math.atan2(spherical.x, spherical.z) - deltaX * 0.01

        // Vertical rotation (polar) - constrain to prevent flipping
        const polar = Math.acos(spherical.y / radius) + deltaY * 0.01
        const constrainedPolar = Math.max(0.1, Math.min(Math.PI - 0.1, polar))

        camera.position.set(
          radius * Math.sin(constrainedPolar) * Math.sin(azimuth),
          radius * Math.cos(constrainedPolar),
          radius * Math.sin(constrainedPolar) * Math.cos(azimuth),
        )

        camera.lookAt(0, 0, 0)
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY }
      } else if (isZooming && event.touches.length === 2) {
        const touch1 = event.touches[0]
        const touch2 = event.touches[1]
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2),
        )

        const deltaDistance = distance - lastDistance
        const zoomFactor = 1 + deltaDistance * 0.01

        // Zoom by moving camera closer/further from origin
        const direction = camera.position.clone().normalize()
        const newDistance = Math.max(10, Math.min(200, camera.position.length() / zoomFactor))
        camera.position.copy(direction.multiplyScalar(newDistance))

        lastDistance = distance
      }
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        // Check for tap gesture
        if (touchStartRef.current && lastTouchRef.current) {
          const timeDiff = Date.now() - touchStartRef.current.time
          const distance = Math.sqrt(
            Math.pow(lastTouchRef.current.x - touchStartRef.current.x, 2) +
              Math.pow(lastTouchRef.current.y - touchStartRef.current.y, 2),
          )

          // If it was a quick tap with minimal movement, it might be a selection
          if (timeDiff < 300 && distance < 10) {
            // Handle tap selection here if needed
          }
        }

        isRotating = false
        isZooming = false
        touchStartRef.current = null
        lastTouchRef.current = null
      }
    }

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [camera, gl, tourActive])

  return null
}
