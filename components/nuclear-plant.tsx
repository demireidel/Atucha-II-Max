"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { Text, Box, Cylinder, Sphere } from "@react-three/drei"
import { useNuclearStore } from "@/lib/store"
import { ReactorCore } from "./reactor-core"
import { ControlRoom } from "./control-room"

export function NuclearPlant() {
  const groupRef = useRef<Group>(null)
  const { isPlaying, currentView } = useNuclearStore()

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current) {
      // Subtle rotation animation
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  if (currentView === "control-room") {
    return <ControlRoom position={[0, 0, 0]} scale={1} />
  }

  return (
    <group ref={groupRef}>
      {/* Containment Building */}
      <group position={[0, 15, 0]}>
        <Cylinder args={[20, 20, 30, 32]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e5e7eb" metalness={0.1} roughness={0.8} />
        </Cylinder>

        {/* Dome */}
        <Sphere args={[20, 32, 16]} position={[0, 15, 0]} castShadow>
          <meshStandardMaterial color="#d1d5db" metalness={0.2} roughness={0.7} />
        </Sphere>
      </group>

      {/* Reactor Core (Enhanced with detailed PHWR components) */}
      {currentView === "reactor" ? (
        <ReactorCore position={[0, 5, 0]} scale={1.2} />
      ) : (
        <group position={[0, 5, 0]}>
          <Cylinder args={[8, 8, 10, 16]} castShadow receiveShadow>
            <meshStandardMaterial
              color="#22c55e"
              metalness={0.8}
              roughness={0.2}
              emissive="#16a34a"
              emissiveIntensity={0.2}
            />
          </Cylinder>

          {/* Simplified pressure tubes for overview */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 6
            return (
              <Cylinder
                key={i}
                args={[0.3, 0.3, 8, 8]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                castShadow
              >
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
              </Cylinder>
            )
          })}
        </group>
      )}

      {/* Turbine Hall */}
      <group position={[40, 10, 0]}>
        <Box args={[30, 20, 15]} castShadow receiveShadow>
          <meshStandardMaterial color="#6b7280" metalness={0.3} roughness={0.7} />
        </Box>

        <Cylinder args={[3, 3, 25, 16]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
        </Cylinder>
      </group>

      {/* Cooling Towers */}
      <group position={[-30, 25, 20]}>
        <Cylinder args={[8, 12, 50, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.9} />
        </Cylinder>

        <Cylinder args={[6, 4, 10, 16]} position={[0, 30, 0]} transparent>
          <meshStandardMaterial color="#ffffff" opacity={0.3} />
        </Cylinder>
      </group>

      <group position={[-30, 25, -20]}>
        <Cylinder args={[8, 12, 50, 16]} castShadow receiveShadow>
          <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.9} />
        </Cylinder>

        <Cylinder args={[6, 4, 10, 16]} position={[0, 30, 0]} transparent>
          <meshStandardMaterial color="#ffffff" opacity={0.3} />
        </Cylinder>
      </group>

      {/* Labels */}
      <Text position={[0, 35, 0]} fontSize={3} color="#22c55e" anchorX="center" anchorY="middle">
        Atucha II PHWR
      </Text>

      <Text position={[0, -5, 0]} fontSize={1.5} color="#6b7280" anchorX="center" anchorY="middle">
        Educational Schematic (Non-Operational)
      </Text>
    </group>
  )
}
