"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Text, Ring } from "@react-three/drei"
import type { Group } from "three"
import { useNuclearStore } from "@/lib/store"
import { InstancedFuelRods } from "./instanced-fuel-rods"

interface FuelAssemblyProps {
  position?: [number, number, number]
  scale?: number
  highlighted?: boolean
}

export function FuelAssembly({ position = [0, 0, 0], scale = 1, highlighted = false }: FuelAssemblyProps) {
  const groupRef = useRef<Group>(null)
  const { isPlaying, reactorTemperature } = useNuclearStore()

  const fuelRodPositions = useMemo(() => {
    const positions: Array<[number, number, number]> = []

    // Create hexagonal fuel rod pattern (typical for CANDU fuel)
    for (let i = 0; i < 37; i++) {
      let x = 0,
        z = 0
      if (i === 0) {
        // Center rod
        x = 0
        z = 0
      } else if (i <= 6) {
        // First ring
        const angle = ((i - 1) / 6) * Math.PI * 2
        x = Math.cos(angle) * 0.04
        z = Math.sin(angle) * 0.04
      } else if (i <= 18) {
        // Second ring
        const angle = ((i - 7) / 12) * Math.PI * 2
        x = Math.cos(angle) * 0.08
        z = Math.sin(angle) * 0.08
      } else {
        // Third ring
        const angle = ((i - 19) / 18) * Math.PI * 2
        x = Math.cos(angle) * 0.12
        z = Math.sin(angle) * 0.12
      }
      positions.push([x, 0, z])
    }
    return positions
  }, [])

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current && highlighted) {
      // Rotation animation for highlighted fuel assembly
      groupRef.current.rotation.z += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Fuel Bundle Structure */}
      <group>
        {/* Central support structure */}
        <Cylinder args={[0.02, 0.02, 0.5, 8]}>
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </Cylinder>

        <InstancedFuelRods count={37} positions={fuelRodPositions} highlighted={highlighted} />

        {/* End caps */}
        <Cylinder args={[0.13, 0.13, 0.02, 16]} position={[0, 0.24, 0]}>
          <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.13, 0.13, 0.02, 16]} position={[0, -0.24, 0]}>
          <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
        </Cylinder>

        {/* Spacer grids */}
        {Array.from({ length: 3 }, (_, i) => (
          <Ring key={i} args={[0.08, 0.13, 8]} position={[0, -0.15 + i * 0.15, 0]}>
            <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
          </Ring>
        ))}
      </group>

      {highlighted && (
        <Text position={[0, 0.4, 0]} fontSize={0.05} color="#22c55e" anchorX="center" anchorY="middle">
          Natural Uranium Fuel Bundle
        </Text>
      )}
    </group>
  )
}
