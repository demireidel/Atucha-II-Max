"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { Text, Box, Cylinder, Sphere, RoundedBox, Torus, Cone } from "@react-three/drei"
import { useNuclearStore } from "@/lib/store"
import { ReactorCore } from "./reactor-core"
import { ControlRoom } from "./control-room"

export function NuclearPlant() {
  const groupRef = useRef<Group>(null)
  const { isPlaying, currentView, qualityLevel } = useNuclearStore()

  const materials = useMemo(
    () => ({
      concrete: {
        color: "#f8fafc",
        metalness: 0.0,
        roughness: 0.85,
        normalScale: [1.2, 1.2] as [number, number],
        envMapIntensity: 0.3,
        clearcoat: 0.1,
        clearcoatRoughness: 0.8,
      },
      steel: {
        color: "#94a3b8",
        metalness: 0.95,
        roughness: 0.05,
        envMapIntensity: 2.5,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      },
      reactor: {
        color: "#059669",
        metalness: 0.9,
        roughness: 0.08,
        emissive: "#047857",
        emissiveIntensity: 0.4,
        envMapIntensity: 2.0,
        clearcoat: 0.9,
        clearcoatRoughness: 0.05,
      },
      pressureTube: {
        color: "#f59e0b",
        metalness: 0.98,
        roughness: 0.02,
        envMapIntensity: 3.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
      },
      turbine: {
        color: "#374151",
        metalness: 0.92,
        roughness: 0.06,
        envMapIntensity: 2.2,
        clearcoat: 0.7,
        clearcoatRoughness: 0.1,
      },
      coolingTower: {
        color: "#f1f5f9",
        metalness: 0.0,
        roughness: 0.9,
        normalScale: [0.8, 0.8] as [number, number],
        envMapIntensity: 0.2,
      },
      steam: {
        color: "#ffffff",
        opacity: 0.4,
        transparent: true,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.8,
        thickness: 2.0,
      },
      reinforcement: {
        color: "#64748b",
        metalness: 0.88,
        roughness: 0.12,
        envMapIntensity: 1.8,
      },
      piping: {
        color: "#71717a",
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.5,
      },
    }),
    [],
  )

  const geometryDetail = useMemo(
    () => ({
      cylinderSegments: qualityLevel >= 4 ? 64 : qualityLevel >= 3 ? 32 : 16,
      sphereSegments: qualityLevel >= 4 ? 64 : qualityLevel >= 3 ? 32 : 16,
      torusSegments: qualityLevel >= 4 ? 32 : qualityLevel >= 3 ? 16 : 8,
    }),
    [qualityLevel],
  )

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current) {
      // Subtle rotation animation
      groupRef.current.rotation.y += delta * 0.02
    }
  })

  if (currentView === "control-room") {
    return <ControlRoom position={[0, 0, 0]} scale={1} />
  }

  return (
    <group ref={groupRef}>
      <group position={[0, 15, 0]}>
        {/* Primary containment vessel */}
        <Cylinder args={[22, 22, 35, geometryDetail.cylinderSegments]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial {...materials.concrete} />
        </Cylinder>

        {/* Detailed reinforcement rings with varying sizes */}
        {Array.from({ length: 8 }, (_, i) => (
          <group key={i}>
            <Cylinder
              args={[22.3, 22.3, 1.2, geometryDetail.cylinderSegments]}
              position={[0, -15 + i * 4.5, 0]}
              castShadow
            >
              <meshPhysicalMaterial {...materials.reinforcement} />
            </Cylinder>
            {/* Reinforcement bolts */}
            {Array.from({ length: 24 }, (_, j) => {
              const angle = (j / 24) * Math.PI * 2
              return (
                <Cylinder
                  key={j}
                  args={[0.08, 0.08, 1.5, 8]}
                  position={[Math.cos(angle) * 22.5, -15 + i * 4.5, Math.sin(angle) * 22.5]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.steel} />
                </Cylinder>
              )
            })}
          </group>
        ))}

        {/* Enhanced dome with realistic proportions */}
        <Sphere
          args={[22, geometryDetail.sphereSegments, geometryDetail.sphereSegments / 2]}
          position={[0, 17.5, 0]}
          castShadow
        >
          <meshPhysicalMaterial {...materials.concrete} />
        </Sphere>

        {/* Dome reinforcement grid */}
        {Array.from({ length: 8 }, (_, i) => (
          <Torus
            key={i}
            args={[18 - i * 2, 0.15, 8, geometryDetail.torusSegments]}
            position={[0, 15 + i * 1.5, 0]}
            castShadow
          >
            <meshPhysicalMaterial {...materials.steel} />
          </Torus>
        ))}

        {/* Containment penetrations */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2
          return (
            <group key={i}>
              <Cylinder
                args={[1.2, 1.2, 2, 16]}
                position={[Math.cos(angle) * 20, 5, Math.sin(angle) * 20]}
                rotation={[0, angle, Math.PI / 2]}
                castShadow
              >
                <meshPhysicalMaterial {...materials.steel} />
              </Cylinder>
              <Cylinder
                args={[0.8, 0.8, 4, 12]}
                position={[Math.cos(angle) * 22, 5, Math.sin(angle) * 22]}
                rotation={[0, angle, Math.PI / 2]}
                castShadow
              >
                <meshPhysicalMaterial {...materials.piping} />
              </Cylinder>
            </group>
          )
        })}
      </group>

      {currentView === "reactor" ? (
        <ReactorCore position={[0, 5, 0]} scale={1.2} />
      ) : (
        <group position={[0, 5, 0]}>
          {/* Enhanced reactor vessel with detailed construction */}
          <Cylinder args={[9, 9, 12, geometryDetail.cylinderSegments]} castShadow receiveShadow>
            <meshPhysicalMaterial {...materials.reactor} />
          </Cylinder>

          {/* Reactor vessel head with realistic dome shape */}
          <Sphere
            args={[9, geometryDetail.sphereSegments, geometryDetail.sphereSegments / 2]}
            position={[0, 6, 0]}
            castShadow
          >
            <meshPhysicalMaterial {...materials.reactor} />
          </Sphere>

          {/* Enhanced pressure tubes with realistic PHWR layout */}
          {Array.from({ length: 36 }, (_, i) => {
            const ring = Math.floor(i / 12)
            const angleInRing = ((i % 12) / 12) * Math.PI * 2
            const radius = 2.5 + ring * 1.8
            return (
              <group key={i}>
                <Cylinder
                  args={[0.3, 0.3, 10, 16]}
                  position={[Math.cos(angleInRing) * radius, 0, Math.sin(angleInRing) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.pressureTube} />
                </Cylinder>
                {/* Fuel channel end fittings */}
                <Cylinder
                  args={[0.4, 0.4, 0.8, 12]}
                  position={[Math.cos(angleInRing) * radius, 5.5, Math.sin(angleInRing) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.steel} />
                </Cylinder>
                <Cylinder
                  args={[0.4, 0.4, 0.8, 12]}
                  position={[Math.cos(angleInRing) * radius, -5.5, Math.sin(angleInRing) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.steel} />
                </Cylinder>
              </group>
            )
          })}

          {/* Enhanced control rod drive mechanisms */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            const radius = 8
            return (
              <group key={i}>
                <Cylinder
                  args={[0.2, 0.2, 15, 12]}
                  position={[Math.cos(angle) * radius, 7.5, Math.sin(angle) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial color="#1f2937" metalness={0.95} roughness={0.05} />
                </Cylinder>
                <Box
                  args={[1.5, 1.5, 1.5]}
                  position={[Math.cos(angle) * radius, 14, Math.sin(angle) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.steel} />
                </Box>
                {/* Drive mechanism details */}
                <Cylinder
                  args={[0.6, 0.6, 2, 8]}
                  position={[Math.cos(angle) * radius, 12, Math.sin(angle) * radius]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.turbine} />
                </Cylinder>
              </group>
            )
          })}
        </group>
      )}

      <group position={[45, 12, 0]}>
        <RoundedBox args={[35, 24, 18]} radius={0.8} castShadow receiveShadow>
          <meshPhysicalMaterial {...materials.concrete} />
        </RoundedBox>

        {/* Main turbine shaft with enhanced detail */}
        <Cylinder
          args={[3.5, 3.5, 30, geometryDetail.cylinderSegments]}
          position={[0, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshPhysicalMaterial {...materials.turbine} />
        </Cylinder>

        {/* Detailed turbine stages */}
        {Array.from({ length: 4 }, (_, i) => (
          <group key={i} position={[-12 + i * 8, 0, 0]}>
            {/* Turbine rotor */}
            <Cylinder args={[2 + i * 0.3, 2 + i * 0.3, 1.5, geometryDetail.cylinderSegments]} castShadow>
              <meshPhysicalMaterial {...materials.steel} />
            </Cylinder>
            {/* Turbine blades with realistic arrangement */}
            {Array.from({ length: 16 }, (_, j) => {
              const angle = (j / 16) * Math.PI * 2
              const bladeRadius = 2.2 + i * 0.3
              return (
                <Box
                  key={j}
                  args={[0.15, 3 + i * 0.4, 0.8]}
                  position={[0, Math.cos(angle) * bladeRadius, Math.sin(angle) * bladeRadius]}
                  rotation={[0, angle + Math.PI / 8, 0]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.steel} />
                </Box>
              )
            })}
            {/* Stator blades */}
            {Array.from({ length: 20 }, (_, j) => {
              const angle = (j / 20) * Math.PI * 2
              const statorRadius = 3.5 + i * 0.3
              return (
                <Box
                  key={j}
                  args={[0.12, 2.5 + i * 0.3, 0.6]}
                  position={[0, Math.cos(angle) * statorRadius, Math.sin(angle) * statorRadius]}
                  rotation={[0, angle, 0]}
                  castShadow
                >
                  <meshPhysicalMaterial {...materials.turbine} />
                </Box>
              )
            })}
          </group>
        ))}

        {/* Enhanced generator with detailed construction */}
        <Cylinder
          args={[2.5, 2.5, 10, geometryDetail.cylinderSegments]}
          position={[12, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshPhysicalMaterial color="#dc2626" metalness={0.9} roughness={0.1} envMapIntensity={2.0} />
        </Cylinder>

        {/* Generator cooling fins */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <Box
              key={i}
              args={[10, 0.2, 1]}
              position={[12, Math.cos(angle) * 2.8, Math.sin(angle) * 2.8]}
              rotation={[0, angle, Math.PI / 2]}
              castShadow
            >
              <meshPhysicalMaterial {...materials.steel} />
            </Box>
          )
        })}
      </group>

      {[
        [-35, 30, 25],
        [-35, 30, -25],
      ].map((pos, index) => (
        <group key={index} position={pos}>
          {/* Hyperboloid cooling tower with accurate proportions */}
          {Array.from({ length: 20 }, (_, i) => {
            const height = i * 2.5
            const t = i / 19
            const radius = 8 + 4 * Math.sin(t * Math.PI) // Hyperboloid shape
            return (
              <Cylinder
                key={i}
                args={[radius, radius, 2.5, geometryDetail.cylinderSegments]}
                position={[0, height - 25, 0]}
                castShadow
                receiveShadow
              >
                <meshPhysicalMaterial {...materials.coolingTower} />
              </Cylinder>
            )
          })}

          {/* Tower top rim with detailed construction */}
          <Cylinder args={[10, 9.5, 3, geometryDetail.cylinderSegments]} position={[0, 27, 0]} castShadow>
            <meshPhysicalMaterial {...materials.concrete} />
          </Cylinder>

          {/* Enhanced steam plume with volumetric appearance */}
          <Cone args={[8, 15, geometryDetail.cylinderSegments]} position={[0, 35, 0]} transparent>
            <meshPhysicalMaterial {...materials.steam} />
          </Cone>

          {/* Water distribution system with detailed piping */}
          <Cylinder args={[9, 9, 2, geometryDetail.cylinderSegments]} position={[0, -23, 0]} castShadow>
            <meshPhysicalMaterial {...materials.steel} />
          </Cylinder>

          {/* Distribution nozzles */}
          {Array.from({ length: 16 }, (_, i) => {
            const angle = (i / 16) * Math.PI * 2
            return (
              <Cylinder
                key={i}
                args={[0.15, 0.15, 1, 8]}
                position={[Math.cos(angle) * 8, -22, Math.sin(angle) * 8]}
                castShadow
              >
                <meshPhysicalMaterial {...materials.piping} />
              </Cylinder>
            )
          })}

          {/* Enhanced support structure */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2
            return (
              <Cylinder
                key={i}
                args={[0.6, 0.6, 50, 12]}
                position={[Math.cos(angle) * 12, -2.5, Math.sin(angle) * 12]}
                castShadow
              >
                <meshPhysicalMaterial {...materials.concrete} />
              </Cylinder>
            )
          })}
        </group>
      ))}

      <group position={[-45, 8, 0]}>
        <RoundedBox args={[18, 16, 25]} radius={0.5} castShadow receiveShadow>
          <meshPhysicalMaterial {...materials.concrete} />
        </RoundedBox>

        {/* Building details */}
        {Array.from({ length: 3 }, (_, floor) => (
          <group key={floor}>
            {Array.from({ length: 6 }, (_, window) => (
              <Box key={window} args={[0.2, 2, 1.5]} position={[9.2, -6 + floor * 5, -10 + window * 4]} castShadow>
                <meshPhysicalMaterial color="#1e40af" metalness={0.1} roughness={0.1} transmission={0.9} />
              </Box>
            ))}
          </group>
        ))}

        <Text position={[0, 12, 0]} fontSize={1.5} color="#6b7280" anchorX="center" anchorY="middle">
          Auxiliary Systems
        </Text>
      </group>

      {Array.from({ length: 6 }, (_, i) => (
        <group key={i}>
          <Cylinder
            args={[1.2, 1.2, 40, 16]}
            position={[22.5, 12 + i * 1.5, -8 + i * 2.5]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <meshPhysicalMaterial {...materials.piping} />
          </Cylinder>
          {/* Pipe supports */}
          {Array.from({ length: 8 }, (_, j) => (
            <Box key={j} args={[0.3, 2, 0.3]} position={[5 + j * 5, 10 + i * 1.5, -8 + i * 2.5]} castShadow>
              <meshPhysicalMaterial {...materials.steel} />
            </Box>
          ))}
        </group>
      ))}

      <Text
        position={[0, 55, 0]}
        fontSize={5}
        color="#059669"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
        castShadow
      >
        Atucha II Nuclear Power Plant
      </Text>

      <Text position={[0, 48, 0]} fontSize={2.5} color="#6b7280" anchorX="center" anchorY="middle">
        745 MWe PHWR • Ultra-High Quality 3D Model
      </Text>

      <Text position={[0, -12, 0]} fontSize={1.5} color="#9ca3af" anchorX="center" anchorY="middle">
        Educational Visualization • Maximum Quality Rendering
      </Text>
    </group>
  )
}
