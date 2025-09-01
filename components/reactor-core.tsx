"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Cylinder, Box, Sphere, Torus, Ring } from "@react-three/drei"
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
    const rows = 27 // Maximum detail hexagonal lattice
    const tubesPerRow = [
      1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 29, 29, 27, 25, 23, 21, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1,
    ]

    let tubeId = 0
    for (let row = 0; row < rows; row++) {
      const numTubes = tubesPerRow[row] || 0
      const rowOffset = (row - (rows - 1) / 2) * 0.65 // Ultra-precise spacing

      for (let col = 0; col < numTubes; col++) {
        const colOffset = (col - (numTubes - 1) / 2) * 0.65
        const distanceFromCenter = Math.sqrt(colOffset * colOffset + rowOffset * rowOffset)
        const temperature = 280 + (15 - distanceFromCenter) * 12 // More realistic gradient
        const flux = Math.max(0, 1 - distanceFromCenter / 15) // Accurate flux distribution

        tubes.push({
          position: new Vector3(isNaN(colOffset) ? 0 : colOffset, 0, isNaN(rowOffset) ? 0 : rowOffset),
          id: tubeId++,
          temperature: isNaN(temperature) ? 280 : temperature,
          flux: isNaN(flux) ? 0 : flux,
        })
      }
    }
    return tubes.slice(0, 451) // Exact Atucha II count
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
        <Cylinder ref={addMeshRef} args={[8.5, 8.5, 5.8, 128]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#e5e7eb"
            metalness={0.98}
            roughness={0.02}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            transparent
            opacity={0.92}
            envMapIntensity={2.0}
            transmission={0.1}
          />
        </Cylinder>

        <Cylinder ref={addMeshRef} args={[8.3, 8.3, 5.6, 128]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#1e40af"
            metalness={0.05}
            roughness={0.95}
            transparent
            opacity={0.15}
            emissive="#1e3a8a"
            emissiveIntensity={0.12}
            transmission={0.8}
            thickness={0.5}
          />
        </Cylinder>

        <Cylinder ref={addMeshRef} args={[9.2, 9.2, 6.5, 128]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#374151"
            metalness={0.95}
            roughness={0.08}
            transparent
            opacity={0.75}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </Cylinder>

        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i / 16) * Math.PI * 2
          const radius = 7.5
          return (
            <group key={`mod-system-${i}`}>
              {/* Main circulation pipe */}
              <Cylinder
                ref={addMeshRef}
                args={[0.18, 0.18, 4.5, 32]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshPhysicalMaterial
                  color="#6b7280"
                  metalness={0.9}
                  roughness={0.15}
                  clearcoat={0.9}
                  clearcoatRoughness={0.05}
                />
              </Cylinder>

              {/* Pipe joints and flanges */}
              <Torus
                ref={addMeshRef}
                args={[0.22, 0.04, 16, 32]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                rotation={[0, angle, Math.PI / 2]}
              >
                <meshPhysicalMaterial color="#4b5563" metalness={0.95} roughness={0.1} />
              </Torus>

              {/* Flow sensors */}
              <Box
                ref={addMeshRef}
                args={[0.12, 0.08, 0.06]}
                position={[Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius]}
              >
                <meshPhysicalMaterial
                  color="#22c55e"
                  metalness={0.8}
                  roughness={0.2}
                  emissive="#16a34a"
                  emissiveIntensity={0.4}
                />
              </Box>
            </group>
          )
        })}

        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 8.8
          return (
            <group key={`support-${i}`}>
              {/* Main support beam */}
              <Box
                ref={addMeshRef}
                args={[0.3, 6, 0.2]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                rotation={[0, angle, 0]}
              >
                <meshPhysicalMaterial color="#374151" metalness={0.9} roughness={0.2} />
              </Box>

              {/* Cross bracing */}
              <Box
                ref={addMeshRef}
                args={[0.15, 0.15, 4]}
                position={[Math.cos(angle) * (radius - 2), 2, Math.sin(angle) * (radius - 2)]}
                rotation={[0, angle + Math.PI / 4, 0]}
              >
                <meshPhysicalMaterial color="#4b5563" metalness={0.85} roughness={0.25} />
              </Box>
            </group>
          )
        })}
      </group>

      {pressureTubes.map((tube) => {
        if (!tube?.position) return null
        const tubePosition = tube.position.toArray ? tube.position.toArray() : [0, 0, 0]

        return (
          <group key={tube.id} position={tubePosition}>
            <Cylinder ref={addMeshRef} args={[0.135, 0.135, 6.2, 48]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshPhysicalMaterial
                color="#9ca3af"
                metalness={0.8}
                roughness={0.25}
                transparent
                opacity={0.85}
                clearcoat={0.7}
                clearcoatRoughness={0.1}
              />
            </Cylinder>

            {/* Inner wall detail */}
            <Cylinder ref={addMeshRef} args={[0.125, 0.125, 6.15, 48]} rotation={[0, 0, Math.PI / 2]}>
              <meshPhysicalMaterial color="#d1d5db" metalness={0.7} roughness={0.3} />
            </Cylinder>

            <Cylinder ref={addMeshRef} args={[0.115, 0.115, 6, 48]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <meshPhysicalMaterial
                color="#fbbf24"
                metalness={0.9}
                roughness={0.12}
                emissive="#f59e0b"
                emissiveIntensity={tube.flux * 0.15}
                clearcoat={0.9}
                clearcoatRoughness={0.05}
              />
            </Cylinder>

            {Array.from({ length: 12 }, (_, bundleIndex) => (
              <group key={bundleIndex} position={[-2.8 + bundleIndex * 0.47, 0, 0]}>
                {/* Bundle end plate */}
                <Ring ref={addMeshRef} args={[0.02, 0.09, 32]} rotation={[0, Math.PI / 2, 0]}>
                  <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
                </Ring>

                {/* Central fuel rod */}
                <Cylinder ref={addMeshRef} args={[0.0065, 0.0065, 0.45, 16]} rotation={[0, 0, Math.PI / 2]}>
                  <meshPhysicalMaterial
                    color="#dc2626"
                    metalness={0.7}
                    roughness={0.35}
                    emissive="#991b1b"
                    emissiveIntensity={tube.flux * 0.4}
                    clearcoat={0.8}
                  />
                </Cylinder>

                {/* First ring - 6 rods */}
                {Array.from({ length: 6 }, (_, rodIndex) => {
                  const angle = (rodIndex / 6) * Math.PI * 2
                  const rodRadius = 0.018
                  return (
                    <Cylinder
                      key={`ring1-${rodIndex}`}
                      ref={addMeshRef}
                      args={[0.0065, 0.0065, 0.45, 16]}
                      position={[0, Math.cos(angle) * rodRadius, Math.sin(angle) * rodRadius]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshPhysicalMaterial
                        color="#dc2626"
                        metalness={0.7}
                        roughness={0.35}
                        emissive="#991b1b"
                        emissiveIntensity={tube.flux * 0.4}
                        clearcoat={0.8}
                      />
                    </Cylinder>
                  )
                })}

                {/* Second ring - 12 rods */}
                {Array.from({ length: 12 }, (_, rodIndex) => {
                  const angle = (rodIndex / 12) * Math.PI * 2
                  const rodRadius = 0.035
                  return (
                    <Cylinder
                      key={`ring2-${rodIndex}`}
                      ref={addMeshRef}
                      args={[0.0065, 0.0065, 0.45, 16]}
                      position={[0, Math.cos(angle) * rodRadius, Math.sin(angle) * rodRadius]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshPhysicalMaterial
                        color="#dc2626"
                        metalness={0.7}
                        roughness={0.35}
                        emissive="#991b1b"
                        emissiveIntensity={tube.flux * 0.4}
                        clearcoat={0.8}
                      />
                    </Cylinder>
                  )
                })}

                {/* Third ring - 18 rods */}
                {Array.from({ length: 18 }, (_, rodIndex) => {
                  const angle = (rodIndex / 18) * Math.PI * 2
                  const rodRadius = 0.052
                  return (
                    <Cylinder
                      key={`ring3-${rodIndex}`}
                      ref={addMeshRef}
                      args={[0.0065, 0.0065, 0.45, 16]}
                      position={[0, Math.cos(angle) * rodRadius, Math.sin(angle) * rodRadius]}
                      rotation={[0, 0, Math.PI / 2]}
                    >
                      <meshPhysicalMaterial
                        color="#dc2626"
                        metalness={0.7}
                        roughness={0.35}
                        emissive="#991b1b"
                        emissiveIntensity={tube.flux * 0.4}
                        clearcoat={0.8}
                      />
                    </Cylinder>
                  )
                })}

                {Array.from({ length: 8 }, (_, gridIndex) => (
                  <group key={`grid-${gridIndex}`} position={[-0.2 + gridIndex * 0.06, 0, 0]}>
                    <Torus ref={addMeshRef} args={[0.06, 0.003, 16, 32]} rotation={[Math.PI / 2, 0, 0]}>
                      <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.15} />
                    </Torus>

                    {/* Grid wires */}
                    {Array.from({ length: 4 }, (_, wireIndex) => (
                      <Cylinder
                        key={`wire-${wireIndex}`}
                        ref={addMeshRef}
                        args={[0.001, 0.001, 0.12, 8]}
                        position={[0, 0, 0]}
                        rotation={[0, 0, (wireIndex * Math.PI) / 4]}
                      >
                        <meshPhysicalMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
                      </Cylinder>
                    ))}
                  </group>
                ))}

                {/* Bundle identification tag */}
                <Box ref={addMeshRef} args={[0.02, 0.01, 0.005]} position={[0.25, 0.08, 0]}>
                  <meshPhysicalMaterial
                    color="#22c55e"
                    metalness={0.6}
                    roughness={0.4}
                    emissive="#16a34a"
                    emissiveIntensity={0.3}
                  />
                </Box>
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
        const xPos = i === 0 ? -18 : 18
        return (
          <group key={`sg-${i}`} position={[xPos, 3, 0]}>
            {/* Main vessel with realistic proportions */}
            <Cylinder ref={addMeshRef} args={[3.2, 3.2, 16, 64]} castShadow receiveShadow>
              <meshPhysicalMaterial
                color="#9ca3af"
                metalness={0.85}
                roughness={0.25}
                clearcoat={0.8}
                clearcoatRoughness={0.1}
              />
            </Cylinder>

            {Array.from({ length: 800 }, (_, tubeIndex) => {
              const spiralTurns = 12
              const angle = (tubeIndex / 800) * Math.PI * 2 * spiralTurns
              const radius = 0.4 + (tubeIndex % 40) * 0.06
              const height = -7 + (tubeIndex / 800) * 14
              return (
                <Cylinder
                  key={tubeIndex}
                  ref={addMeshRef}
                  args={[0.009, 0.009, 0.8, 8]}
                  position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}
                  rotation={[Math.sin(angle) * 0.1, angle * 0.1, 0]}
                >
                  <meshPhysicalMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    roughness={0.15}
                    emissive="#f59e0b"
                    emissiveIntensity={0.1}
                  />
                </Cylinder>
              )
            })}

            {/* Tube sheet details */}
            <Cylinder ref={addMeshRef} args={[3.0, 3.0, 0.4, 64]} position={[0, -7.8, 0]}>
              <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
            </Cylinder>

            {/* Steam dome */}
            <Sphere ref={addMeshRef} args={[3.2, 32, 16]} position={[0, 8, 0]} scale={[1, 0.5, 1]}>
              <meshPhysicalMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
            </Sphere>

            {/* Multiple steam outlets */}
            {Array.from({ length: 4 }, (_, outletIndex) => {
              const angle = (outletIndex / 4) * Math.PI * 2
              return (
                <Cylinder
                  key={`outlet-${outletIndex}`}
                  ref={addMeshRef}
                  args={[0.6, 0.6, 2.5, 24]}
                  position={[Math.cos(angle) * 2.5, 10, Math.sin(angle) * 2.5]}
                  rotation={[0, angle, Math.PI / 6]}
                >
                  <meshPhysicalMaterial color="#d1d5db" metalness={0.85} roughness={0.15} />
                </Cylinder>
              )
            })}

            {/* Feedwater distribution system */}
            <Torus ref={addMeshRef} args={[2.8, 0.2, 16, 32]} position={[0, -5, 0]}>
              <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.1} />
            </Torus>

            {/* Feedwater nozzles */}
            {Array.from({ length: 8 }, (_, nozzleIndex) => {
              const angle = (nozzleIndex / 8) * Math.PI * 2
              return (
                <Cylinder
                  key={`nozzle-${nozzleIndex}`}
                  ref={addMeshRef}
                  args={[0.15, 0.15, 1.5, 16]}
                  position={[Math.cos(angle) * 3.2, -5, Math.sin(angle) * 3.2]}
                  rotation={[0, angle, Math.PI / 2]}
                >
                  <meshPhysicalMaterial color="#6b7280" metalness={0.9} roughness={0.15} />
                </Cylinder>
              )
            })}
          </group>
        )
      })}

      <Text position={[0, 15, 0]} fontSize={1.5} color="#22c55e" anchorX="center" anchorY="middle">
        Atucha II PHWR Reactor Core - Maximum Detail
      </Text>

      <Text position={[0, -12, 0]} fontSize={0.8} color="#6b7280" anchorX="center" anchorY="middle">
        {pressureTubes.length} Pressure Tubes • {controlRods.length} Control Rods • 2 Steam Generators • 37-Rod Fuel
        Bundles
      </Text>

      <Text position={[0, -13.5, 0]} fontSize={0.6} color="#9ca3af" anchorX="center" anchorY="middle">
        Heavy Water Moderated & Cooled • Natural Uranium Fuel • 745 MWe • Siemens KWU Design
      </Text>

      <Text position={[0, -15, 0]} fontSize={0.5} color="#6b7280" anchorX="center" anchorY="middle">
        Operating: 280-310°C • 11.8 MPa • Burnup: 7,000 MWd/tU • Enrichment: 0.85% U-235
      </Text>
    </group>
  )
}
