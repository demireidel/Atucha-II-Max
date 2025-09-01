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
      {/* Enhanced Containment Building */}
      <group position={[0, 15, 0]}>
        <Cylinder args={[20, 20, 30, 64]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#e8eaed"
            metalness={0.1}
            roughness={0.3}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
            reflectivity={0.5}
          />
        </Cylinder>

        {/* Enhanced Dome with realistic concrete material */}
        <Sphere args={[20, 64, 32]} position={[0, 15, 0]} castShadow>
          <meshPhysicalMaterial
            color="#d4d6d9"
            metalness={0.05}
            roughness={0.8}
            clearcoat={0.1}
            normalScale={[0.5, 0.5]}
          />
        </Sphere>
      </group>

      {/* Reactor Core (Enhanced with detailed PHWR components) */}
      {currentView === "reactor" ? (
        <ReactorCore position={[0, 5, 0]} scale={1.2} />
      ) : (
        <group position={[0, 5, 0]}>
          <Cylinder args={[8, 8, 10, 32]} castShadow receiveShadow>
            <meshPhysicalMaterial
              color="#22c55e"
              metalness={0.9}
              roughness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              emissive="#16a34a"
              emissiveIntensity={0.3}
              transmission={0.1}
              thickness={0.5}
            />
          </Cylinder>

          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 6
            return (
              <Cylinder
                key={i}
                args={[0.3, 0.3, 8, 16]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.95}
                  roughness={0.05}
                  clearcoat={1.0}
                  clearcoatRoughness={0.05}
                  reflectivity={0.9}
                />
              </Cylinder>
            )
          })}
        </group>
      )}

      {/* Enhanced Turbine Hall with industrial materials */}
      <group position={[40, 10, 0]}>
        <Box args={[30, 20, 15]} castShadow receiveShadow>
          <meshPhysicalMaterial color="#6b7280" metalness={0.4} roughness={0.6} clearcoat={0.2} />
        </Box>

        <Cylinder args={[3, 3, 25, 32]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshPhysicalMaterial
            color="#374151"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
          />
        </Cylinder>
      </group>

      {/* Enhanced Cooling Towers with realistic concrete texture */}
      <group position={[-30, 25, 20]}>
        <Cylinder args={[8, 12, 50, 32]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#9ca3af"
            metalness={0.05}
            roughness={0.9}
            clearcoat={0.1}
            normalScale={[1.0, 1.0]}
          />
        </Cylinder>

        <Cylinder args={[6, 4, 10, 16]} position={[0, 30, 0]} transparent>
          <meshPhysicalMaterial color="#ffffff" opacity={0.4} transmission={0.8} thickness={2.0} roughness={0.1} />
        </Cylinder>
      </group>

      <group position={[-30, 25, -20]}>
        <Cylinder args={[8, 12, 50, 32]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#9ca3af"
            metalness={0.05}
            roughness={0.9}
            clearcoat={0.1}
            normalScale={[1.0, 1.0]}
          />
        </Cylinder>

        <Cylinder args={[6, 4, 10, 16]} position={[0, 30, 0]} transparent>
          <meshPhysicalMaterial color="#ffffff" opacity={0.4} transmission={0.8} thickness={2.0} roughness={0.1} />
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
