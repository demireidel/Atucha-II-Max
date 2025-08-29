"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { useNuclearStore } from "@/lib/store"
import { Vector3 } from "three"

export function TourCameraController() {
  const { camera } = useThree()
  const { tourActive, tourCameraTarget } = useNuclearStore()

  useEffect(() => {
    if (tourActive && tourCameraTarget) {
      // Animate camera to tour position
      const targetPosition = new Vector3(...tourCameraTarget.position)
      const targetLookAt = new Vector3(...tourCameraTarget.target)

      // Smooth camera animation
      const animateCamera = () => {
        camera.position.lerp(targetPosition, 0.05)
        camera.lookAt(targetLookAt)

        if (camera.position.distanceTo(targetPosition) > 1) {
          requestAnimationFrame(animateCamera)
        }
      }

      animateCamera()
    }
  }, [tourActive, tourCameraTarget, camera])

  return null
}
