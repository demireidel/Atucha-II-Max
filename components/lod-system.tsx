"use client"

import type React from "react"
import { useRef, useMemo, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { type Group, Vector3 } from "three"
import { useNuclearStore } from "@/lib/store"

interface LODSystemProps {
  children: React.ReactNode
  position?: [number, number, number]
  highDetail: React.ReactNode
  mediumDetail: React.ReactNode
  lowDetail: React.ReactNode
}

export function LODSystem({ children, position = [0, 0, 0], highDetail, mediumDetail, lowDetail }: LODSystemProps) {
  const groupRef = useRef<Group>(null)
  const { camera } = useThree()
  const { lodDistance, qualityLevel } = useNuclearStore()

  const objectPosition = useMemo(() => new Vector3(...position), [position])

  const [currentLOD, setCurrentLOD] = useState<"high" | "medium" | "low">("high")

  useFrame(() => {
    if (groupRef.current && camera) {
      const distance = camera.position.distanceTo(objectPosition)

      // Adjust LOD based on distance and quality settings
      const highThreshold = lodDistance * (qualityLevel / 4)
      const mediumThreshold = highThreshold * 2

      let newLOD: "high" | "medium" | "low"

      if (distance < highThreshold) {
        newLOD = "high"
      } else if (distance < mediumThreshold) {
        newLOD = "medium"
      } else {
        newLOD = "low"
      }

      if (newLOD !== currentLOD) {
        setCurrentLOD(newLOD)
      }
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {currentLOD === "high" && highDetail}
      {currentLOD === "medium" && mediumDetail}
      {currentLOD === "low" && lowDetail}
      {children}
    </group>
  )
}
