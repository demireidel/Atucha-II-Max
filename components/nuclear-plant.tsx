"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { Text, Box, Cylinder, Sphere, RoundedBox } from "@react-three/drei"
import { useNuclearStore } from "@/lib/store"
import { ReactorCore } from "./reactor-core"
import { ControlRoom } from "./control-room"

export function NuclearPlant() {
  const groupRef = useRef<Group>(null)
  const { isPlaying, currentView } = useNuclearStore()

  const materials = useMemo(
    () => ({
      concrete: {
        color: "#f3f4f6",
        metalness: 0.0,
        roughness: 0.95,
        normalScale: [0.5, 0.5] as [number, number],
      },
      steel: {
        color: "#9ca3af",
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.5,
      },
      reactor: {
        color: "#10b981",
        metalness: 0.8,
        roughness: 0.15,
        emissive: "#059669",
        emissiveIntensity: 0.3,
      },
      pressureTube: {
        color: "#f59e0b",
        metalness: 0.95,
        roughness: 0.05,
        envMapIntensity: 2.0,
      },
      turbine: {
        color: "#374151",
        metalness: 0.85,
        roughness: 0.1,
        envMapIntensity: 1.8,
      },
      coolingTower: {
        color: "#e5e7eb",
        metalness: 0.0,
        roughness: 0.9,
      },
      steam: {
        color: "#ffffff",
        opacity: 0.6,
        transparent: true,
        roughness: 0.0,
        metalness: 0.0,
      },
    }),
    [],
  )

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
      <group position={[0, 15, 0]}>
        {/* Main containment structure */}
        <Cylinder args={[20, 20, 30, 64]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial {...materials.concrete} />
        </Cylinder>

        {/* Reinforcement rings */}
        {Array.from({ length: 6 }, (_, i) => (
          <Cylinder key={i} args={[20.2, 20.2, 1, 32]} position={[0, -12 + i * 5, 0]} castShadow>
            <meshStandardMaterial {...materials.steel} />
          </Cylinder>
        ))}

        {/* Enhanced dome with better geometry */}
        <Sphere args={[20, 64, 32]} position={[0, 15, 0]} castShadow>
          <meshStandardMaterial {...materials.concrete} />
        </Sphere>

        {/* Dome reinforcement */}
        <Sphere args={[20.1, 32, 16]} position={[0, 15, 0]} castShadow>
          <meshStandardMaterial {...materials.steel} wireframe opacity={0.3} transparent />
        </Sphere>
      </group>

      {currentView === "reactor" ? (
        <ReactorCore position={[0, 5, 0]} scale={1.2} />
      ) : (
        <group position={[0, 5, 0]}>
          {/* Main reactor vessel */}
          <Cylinder args={[8, 8, 10, 32]} castShadow receiveShadow>
            <meshStandardMaterial {...materials.reactor} />
          </Cylinder>

          {/* Reactor vessel head */}
          <Sphere args={[8, 32, 16]} position={[0, 5, 0]} castShadow>
            <meshStandardMaterial {...materials.reactor} />
          </Sphere>

          {/* Enhanced pressure tubes with better arrangement */}
          {Array.from({ length: 24 }, (_, i) => {
            const ring = Math.floor(i / 8)
            const angleInRing = ((i % 8) / 8) * Math.PI * 2
            const radius = 3 + ring * 2
            return (
              <group key={i}>
                <Cylinder
                  args={[0.25, 0.25, 8, 16]}
                  position={[Math.cos(angleInRing) * radius, 0, Math.sin(angleInRing) * radius]}
                  castShadow
                >
                  <meshStandardMaterial {...materials.pressureTube} />
                </Cylinder>
                {/* Fuel channel ends */}
                <Cylinder
                  args={[0.3, 0.3, 0.5, 8]}
                  position={[Math.cos(angleInRing) * radius, 4.5, Math.sin(angleInRing) * radius]}
                  castShadow
                >
                  <meshStandardMaterial {...materials.steel} />
                </Cylinder>
              </group>
            )
          })}

          {/* Control rod drive mechanisms */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const radius = 7
            return (
              <group key={i}>
                <Cylinder
                  args={[0.15, 0.15, 12, 8]}
                  position={[Math.cos(angle) * radius, 6, Math.sin(angle) * radius]}
                  castShadow
                >
                  <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
                </Cylinder>
                <Box args={[1, 1, 1]} position={[Math.cos(angle) * radius, 11, Math.sin(angle) * radius]} castShadow>
                  <meshStandardMaterial {...materials.steel} />
                </Box>
              </group>
            )
          })}
        </group>
      )}

      <group position={[40, 10, 0]}>
        <RoundedBox args={[30, 20, 15]} radius={0.5} castShadow receiveShadow>
          <meshStandardMaterial {...materials.concrete} />
        </RoundedBox>

        {/* Main turbine shaft */}
        <Cylinder args={[3, 3, 25, 32]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial {...materials.turbine} />
        </Cylinder>

        {/* Turbine blades */}
        {Array.from({ length: 3 }, (_, i) => (
          <group key={i} position={[-8 + i * 8, 0, 0]}>
            {Array.from({ length: 12 }, (_, j) => {
              const angle = (j / 12) * Math.PI * 2
              return (
                <Box
                  key={j}
                  args={[0.1, 2, 0.5]}
                  position={[0, Math.cos(angle) * 2.5, Math.sin(angle) * 2.5]}
                  rotation={[0, angle, 0]}
                  castShadow
                >
                  <meshStandardMaterial {...materials.steel} />
                </Box>
              )
            })}
          </group>
        ))}

        {/* Generator */}
        <Cylinder args={[2, 2, 8, 16]} position={[10, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
        </Cylinder>
      </group>

      {([
        [-30, 25, 20] as [number, number, number],
        [-30, 25, -20] as [number, number, number],
      ]).map((pos, index) => (
        <group key={index} position={pos}>
          {/* Main tower structure with hyperboloid shape */}
          <Cylinder args={[8, 12, 50, 32]} castShadow receiveShadow>
            <meshStandardMaterial {...materials.coolingTower} />
          </Cylinder>

          {/* Tower top rim */}
          <Cylinder args={[8.2, 7.8, 2, 32]} position={[0, 26, 0]} castShadow>
            <meshStandardMaterial {...materials.concrete} />
          </Cylinder>

          {/* Steam plume with better animation */}
          <Cylinder args={[6, 4, 10, 16]} position={[0, 30, 0]}>
            <meshStandardMaterial {...materials.steam} />
          </Cylinder>

          {/* Water distribution system */}
          <Cylinder args={[7, 7, 1, 16]} position={[0, -20, 0]} castShadow>
            <meshStandardMaterial {...materials.steel} />
          </Cylinder>

          {/* Support pillars */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2
            return (
              <Cylinder
                key={i}
                args={[0.5, 0.5, 45, 8]}
                position={[Math.cos(angle) * 10, -2.5, Math.sin(angle) * 10]}
                castShadow
              >
                <meshStandardMaterial {...materials.concrete} />
              </Cylinder>
            )
          })}
        </group>
      ))}

      <group position={[-40, 5, 0]}>
        <RoundedBox args={[15, 10, 20]} radius={0.3} castShadow receiveShadow>
          <meshStandardMaterial {...materials.concrete} />
        </RoundedBox>
        <Text position={[0, 8, 0]} fontSize={1} color="#6b7280" anchorX="center" anchorY="middle">
          Auxiliary Building
        </Text>
      </group>

      {/* Steam lines */}
      {Array.from({ length: 4 }, (_, i) => (
        <Cylinder
          key={i}
          args={[0.8, 0.8, 35, 16]}
          position={[20, 8 + i * 2, -5 + i * 2]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshStandardMaterial {...materials.steel} />
        </Cylinder>
      ))}

      <Text
        position={[0, 45, 0]}
        fontSize={4}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        Atucha II Nuclear Power Plant
      </Text>

      <Text position={[0, 40, 0]} fontSize={2} color="#6b7280" anchorX="center" anchorY="middle">
        745 MWe PHWR • Interactive 3D Model
      </Text>

      <Text position={[0, -8, 0]} fontSize={1.2} color="#9ca3af" anchorX="center" anchorY="middle">
        Educational Visualization • Not for Operational Use
      </Text>
    </group>
  )
}
