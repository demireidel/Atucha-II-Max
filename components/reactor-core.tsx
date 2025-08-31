"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Cylinder, Box, Sphere, Torus } from "@react-three/drei"
import { type Group, Vector3, type Mesh } from "three"
import { useNuclearStore } from "@/lib/store"

interface ReactorCoreProps {
  position?: [number, number, number]
  scale?: number
}

export function ReactorCore({ position = [0, 0, 0], scale = 1 }: ReactorCoreProps) {
  const groupRef = useRef<Group>(null)
  const meshRefs = useRef<Mesh[]>([])
  const { isPlaying, reactorTemperature, neutronFlux } = useNuclearStore()

  useEffect(() => {
    return () => {
      // Cleanup geometries and materials on unmount
      meshRefs.current.forEach((mesh) => {
        if (mesh?.geometry) {
          mesh.geometry.dispose()
        }
        if (mesh?.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material?.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
      meshRefs.current = []
    }
  }, [])

  const pressureTubes = useMemo(() => {
    const tubes: Array<{ position: Vector3; id: number; temperature: number; flux: number }> = []
    // Atucha II has 451 pressure tubes in hexagonal lattice
    const rows = 25 // Increased for Atucha II accuracy
    const tubesPerRow = [
      5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 25, 25, 25, 25, 25, 25, 23, 21, 19, 17, 15, 13, 11, 9, 7, 5,
    ]

    let tubeId = 0
    for (let row = 0; row < rows; row++) {
      const numTubes = tubesPerRow[row] || 0
      const rowOffset = (row - (rows - 1) / 2) * 0.8 // Tighter spacing for realism

      for (let col = 0; col < numTubes; col++) {
        const colOffset = (col - (numTubes - 1) / 2) * 0.8
        // Simulate temperature and neutron flux variations
        const distanceFromCenter = Math.sqrt(colOffset * colOffset + rowOffset * rowOffset)
        const temperature = 280 + (15 - distanceFromCenter) * 8 // Higher temp at center
        const flux = Math.max(0, 1 - distanceFromCenter / 12) // Peak flux at center

        tubes.push({
          position: new Vector3(isNaN(colOffset) ? 0 : colOffset, 0, isNaN(rowOffset) ? 0 : rowOffset),
          id: tubeId++,
          temperature: isNaN(temperature) ? 280 : temperature,
          flux: isNaN(flux) ? 0 : flux,
        })
      }
    }
    return tubes
  }, [])

  const controlRods = useMemo(() => {
    if (!pressureTubes || pressureTubes.length === 0) {
      return []
    }
    return pressureTubes.filter((_, index) => index % 12 === 0).slice(0, 37) // Atucha II has 37 control rods
  }, [pressureTubes])

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current) {
      // More subtle reactor operation animation
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.005 + 1
      groupRef.current.scale.setScalar(scale * pulse)

      // Animate neutron flux visualization
      meshRefs.current.forEach((mesh, index) => {
        if (mesh?.material && typeof mesh.material === "object" && "emissiveIntensity" in mesh.material) {
          const baseIntensity = 0.1
          const fluxVariation = Math.sin(state.clock.elapsedTime * 2 + index * 0.1) * 0.05
          mesh.material.emissiveIntensity = baseIntensity + fluxVariation
        }
      })
    }
  })

  const addMeshRef = (mesh: Mesh | null) => {
    if (mesh && !meshRefs.current.includes(mesh)) {
      meshRefs.current.push(mesh)
    }
  }

  if (!pressureTubes || pressureTubes.length === 0) {
    return (
      <group position={position} scale={scale}>
        <Text position={[0, 0, 0]} fontSize={1} color="#ef4444" anchorX="center" anchorY="middle">
          Loading Reactor Core...
        </Text>
      </group>
    )
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group position={[0, 0, 0]}>
        {/* Main calandria vessel - stainless steel */}
        <Cylinder ref={addMeshRef} args={[8.5, 8.5, 5.8, 64]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#e5e7eb"
            metalness={0.95}
            roughness={0.05}
            transparent
            opacity={0.9}
            envMapIntensity={1.5}
          />
        </Cylinder>

        {/* Calandria shell - outer containment */}
        <Cylinder ref={addMeshRef} args={[9.2, 9.2, 6.5, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
        </Cylinder>

        <Cylinder ref={addMeshRef} args={[8.3, 8.3, 5.6, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#1e40af"
            metalness={0.05}
            roughness={0.95}
            transparent
            opacity={0.25}
            emissive="#1e3a8a"
            emissiveIntensity={0.08}
          />
        </Cylinder>

        {/* Moderator circulation pipes */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 7.5
          return (
            <Cylinder
              key={`mod-pipe-${i}`}
              ref={addMeshRef}
              args={[0.15, 0.15, 4, 16]}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
            </Cylinder>
          )
        })}
      </group>

      {pressureTubes.map((tube) => {
        if (!tube?.position) return null

        const tubePosition = tube.position.toArray ? tube.position.toArray() : [0, 0, 0]

        return (
          <group key={tube.id} position={tubePosition}>
            {/* Calandria tube (surrounds pressure tube) */}
            <Cylinder ref={addMeshRef} args={[0.13, 0.13, 6.2, 24]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} transparent opacity={0.8} />
            </Cylinder>

            {/* Pressure tube (Zircaloy-4) */}
            <Cylinder ref={addMeshRef} args={[0.11, 0.11, 6, 24]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.85}
                roughness={0.15}
                emissive="#f59e0b"
                emissiveIntensity={tube.flux * 0.1}
              />
            </Cylinder>

            {/* Fuel bundles with individual fuel rods */}
            {Array.from({ length: 12 }, (_, bundleIndex) => (
              <group key={bundleIndex} position={[-2.5 + bundleIndex * 0.42, 0, 0]}>
                {/* Central fuel rod */}
                <Cylinder ref={addMeshRef} args={[0.006, 0.006, 0.4, 8]} rotation={[0, 0, Math.PI / 2]}>
                  <meshStandardMaterial
                    color="#dc2626"
                    metalness={0.6}
                    roughness={0.4}
                    emissive="#991b1b"
                    emissiveIntensity={tube.flux * 0.3}
                  />
                </Cylinder>

                {/* Ring of 6 fuel rods around center */}
                {Array.from({ length: 6 }, (_, rodIndex) => {
                  const angle = (rodIndex / 6) * Math.PI * 2
                  const rodRadius = 0.015
                  return (
                    <Cylinder
                      key={rodIndex}
                      ref={addMeshRef}
                      args={[0.006, 0.006, 0.4, 8]}
                      position={[0, Math.cos(angle) * rodRadius, Math.sin(angle) * rodRadius]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshStandardMaterial
                        color="#dc2626"
                        metalness={0.6}
                        roughness={0.4}
                        emissive="#991b1b"
                        emissiveIntensity={tube.flux * 0.3}
                      />
                    </Cylinder>
                  )
                })}

                {/* Outer ring of 12 fuel rods */}
                {Array.from({ length: 12 }, (_, rodIndex) => {
                  const angle = (rodIndex / 12) * Math.PI * 2
                  const rodRadius = 0.03
                  return (
                    <Cylinder
                      key={`outer-${rodIndex}`}
                      ref={addMeshRef}
                      args={[0.006, 0.006, 0.4, 8]}
                      position={[0, Math.cos(angle) * rodRadius, Math.sin(angle) * rodRadius]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshStandardMaterial
                        color="#dc2626"
                        metalness={0.6}
                        roughness={0.4}
                        emissive="#991b1b"
                        emissiveIntensity={tube.flux * 0.3}
                      />
                    </Cylinder>
                  )
                })}

                {/* Spacer grids */}
                <Torus ref={addMeshRef} args={[0.04, 0.002, 8, 16]} rotation={[Math.PI / 2, 0, 0]}>
                  <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
                </Torus>
              </group>
            ))}
          </group>
        )
      })}

      {controlRods.map((rod, index) => {
        if (!rod?.position) return null

        const rodPosition = rod.position.toArray ? rod.position.toArray() : [0, 0, 0]

        return (
          <group key={`control-${index}`} position={rodPosition}>
            {/* Control rod assembly - neutron absorbing material */}
            <Cylinder ref={addMeshRef} args={[0.045, 0.045, 5.5, 16]} position={[0, 2.75, 0]} castShadow>
              <meshStandardMaterial
                color="#1f2937"
                metalness={0.95}
                roughness={0.05}
                emissive="#111827"
                emissiveIntensity={0.1}
              />
            </Cylinder>

            {/* Control rod guide tube */}
            <Cylinder ref={addMeshRef} args={[0.06, 0.06, 8, 16]} position={[0, 4, 0]} castShadow>
              <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.2} transparent opacity={0.7} />
            </Cylinder>

            {/* Drive mechanism housing */}
            <Box ref={addMeshRef} args={[0.4, 0.6, 0.4]} position={[0, 8.5, 0]} castShadow>
              <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
            </Box>

            {/* Drive motor */}
            <Cylinder ref={addMeshRef} args={[0.15, 0.15, 0.3, 16]} position={[0, 9.2, 0]} castShadow>
              <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} />
            </Cylinder>

            {/* Position indicator */}
            <Box ref={addMeshRef} args={[0.1, 0.1, 0.05]} position={[0.25, 8.5, 0]} castShadow>
              <meshStandardMaterial
                color="#22c55e"
                metalness={0.7}
                roughness={0.3}
                emissive="#16a34a"
                emissiveIntensity={0.5}
              />
            </Box>
          </group>
        )
      })}

      {Array.from({ length: 2 }, (_, i) => {
        const xPos = i === 0 ? -15 : 15
        return (
          <group key={`sg-${i}`} position={[xPos, 3, 0]}>
            {/* Steam generator vessel */}
            <Cylinder ref={addMeshRef} args={[2.5, 2.5, 14, 32]} castShadow receiveShadow>
              <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
            </Cylinder>

            {/* Tube bundle (simplified representation) */}
            {Array.from({ length: 200 }, (_, tubeIndex) => {
              const angle = (tubeIndex / 200) * Math.PI * 2 * 8
              const radius = 0.3 + (tubeIndex % 8) * 0.25
              const height = -6 + (tubeIndex % 20) * 0.6
              return (
                <Cylinder
                  key={tubeIndex}
                  ref={addMeshRef}
                  args={[0.008, 0.008, 12, 6]}
                  position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
                >
                  <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
                </Cylinder>
              )
            })}

            {/* Steam outlet */}
            <Cylinder ref={addMeshRef} args={[0.8, 0.8, 3, 16]} position={[0, 9, 0]} castShadow>
              <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
            </Cylinder>

            {/* Feedwater inlet */}
            <Cylinder
              ref={addMeshRef}
              args={[0.4, 0.4, 2, 12]}
              position={[2.5, -4, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.2} />
            </Cylinder>
          </group>
        )
      })}

      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const radius = 8.8
        return (
          <group key={`instrument-${i}`} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            {/* Neutron detector */}
            <Cylinder ref={addMeshRef} args={[0.03, 0.03, 0.8, 12]} castShadow>
              <meshStandardMaterial
                color="#22c55e"
                metalness={0.7}
                roughness={0.3}
                emissive="#16a34a"
                emissiveIntensity={0.4}
              />
            </Cylinder>

            {/* Temperature sensor */}
            <Sphere ref={addMeshRef} args={[0.02, 16, 16]} position={[0, 0.5, 0]} castShadow>
              <meshStandardMaterial
                color="#ef4444"
                metalness={0.6}
                roughness={0.4}
                emissive="#dc2626"
                emissiveIntensity={0.3}
              />
            </Sphere>

            {/* Sensor cable */}
            <Cylinder ref={addMeshRef} args={[0.01, 0.01, 2, 8]} position={[0, 1.5, 0]} castShadow>
              <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.8} />
            </Cylinder>
          </group>
        )
      })}

      <Text position={[0, 12, 0]} fontSize={1.2} color="#22c55e" anchorX="center" anchorY="middle">
        Atucha II PHWR Reactor Core
      </Text>

      <Text position={[0, -10, 0]} fontSize={0.7} color="#6b7280" anchorX="center" anchorY="middle">
        {pressureTubes.length} Pressure Tubes • {controlRods.length} Control Rods • 2 Steam Generators
      </Text>

      <Text position={[0, -11.2, 0]} fontSize={0.5} color="#9ca3af" anchorX="center" anchorY="middle">
        Heavy Water Moderated & Cooled • Natural Uranium Fuel • 745 MWe
      </Text>

      <Text position={[0, -12.4, 0]} fontSize={0.4} color="#6b7280" anchorX="center" anchorY="middle">
        Operating Temperature: 280-310°C • Pressure: 11.8 MPa • Burnup: 7,000 MWd/tU
      </Text>
    </group>
  )
}
