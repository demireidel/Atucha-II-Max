"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Cylinder, Box } from "@react-three/drei"
import { type Group, Vector3, type Mesh } from "three"
import { useNuclearStore } from "@/lib/store"

interface ReactorCoreProps {
  position?: [number, number, number]
  scale?: number
}

export function ReactorCore({ position = [0, 0, 0], scale = 1 }: ReactorCoreProps) {
  const groupRef = useRef<Group>(null)
  const meshRefs = useRef<Mesh[]>([])
  const { isPlaying, reactorTemperature } = useNuclearStore()

  useEffect(() => {
    return () => {
      // Cleanup geometries and materials on unmount
      meshRefs.current.forEach((mesh) => {
        if (mesh.geometry) {
          mesh.geometry.dispose()
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose())
          } else {
            mesh.material.dispose()
          }
        }
      })
      meshRefs.current = []
    }
  }, [])

  // Generate pressure tube positions in a hexagonal lattice pattern
  const pressureTubes = useMemo(() => {
    const tubes: Array<{ position: Vector3; id: number }> = []
    const rows = 19 // Typical for PHWR design
    const tubesPerRow = [7, 9, 11, 13, 15, 17, 19, 19, 19, 19, 19, 19, 19, 17, 15, 13, 11, 9, 7]

    let tubeId = 0
    for (let row = 0; row < rows; row++) {
      const numTubes = tubesPerRow[row]
      const rowOffset = (row - (rows - 1) / 2) * 1.2

      for (let col = 0; col < numTubes; col++) {
        const colOffset = (col - (numTubes - 1) / 2) * 1.2
        tubes.push({
          position: new Vector3(colOffset, 0, rowOffset),
          id: tubeId++,
        })
      }
    }
    return tubes
  }, [])

  // Control rod positions (subset of pressure tube positions)
  const controlRods = useMemo(() => {
    return pressureTubes.filter((_, index) => index % 8 === 0).slice(0, 32)
  }, [pressureTubes])

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current) {
      // Subtle pulsing animation for reactor activity
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1
      groupRef.current.scale.setScalar(scale * pulse)
    }
  })

  const addMeshRef = (mesh: Mesh | null) => {
    if (mesh && !meshRefs.current.includes(mesh)) {
      meshRefs.current.push(mesh)
    }
  }

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Calandria Vessel - Main reactor vessel containing moderator */}
      <group position={[0, 0, 0]}>
        <Cylinder ref={addMeshRef} args={[12, 12, 6, 32]} castShadow receiveShadow>
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
        </Cylinder>

        {/* Heavy Water Moderator (visual representation) */}
        <Cylinder ref={addMeshRef} args={[11.5, 11.5, 5.8, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#3b82f6"
            metalness={0.1}
            roughness={0.9}
            transparent
            opacity={0.3}
            emissive="#1e40af"
            emissiveIntensity={0.1}
          />
        </Cylinder>
      </group>

      {/* Pressure Tubes - Contains fuel bundles and coolant */}
      {pressureTubes.map((tube) => (
        <group key={tube.id} position={tube.position.toArray()}>
          {/* Pressure tube */}
          <Cylinder ref={addMeshRef} args={[0.15, 0.15, 12, 16]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </Cylinder>

          {/* Fuel bundles inside pressure tube */}
          {Array.from({ length: 8 }, (_, i) => (
            <Cylinder
              key={i}
              ref={addMeshRef}
              args={[0.12, 0.12, 0.5, 8]}
              position={[-4 + i * 1, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial
                color="#dc2626"
                metalness={0.6}
                roughness={0.4}
                emissive="#991b1b"
                emissiveIntensity={0.2}
              />
            </Cylinder>
          ))}
        </group>
      ))}

      {/* Control Rods */}
      {controlRods.map((rod, index) => (
        <group key={`control-${index}`} position={rod.position.toArray()}>
          <Cylinder ref={addMeshRef} args={[0.08, 0.08, 8, 12]} position={[0, 4, 0]} castShadow>
            <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.1} />
          </Cylinder>

          {/* Control rod drive mechanism */}
          <Box ref={addMeshRef} args={[0.3, 0.3, 0.3]} position={[0, 8, 0]} castShadow>
            <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
          </Box>
        </group>
      ))}

      {/* Steam Generators (4 units typical for PHWR) */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const radius = 18
        return (
          <group key={`sg-${i}`} position={[Math.cos(angle) * radius, 5, Math.sin(angle) * radius]}>
            <Cylinder ref={addMeshRef} args={[3, 3, 12, 16]} castShadow receiveShadow>
              <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.4} />
            </Cylinder>

            {/* Steam lines */}
            <Cylinder ref={addMeshRef} args={[0.5, 0.5, 8, 12]} position={[0, 8, 0]} castShadow>
              <meshStandardMaterial color="#d1d5db" metalness={0.8} roughness={0.2} />
            </Cylinder>
          </group>
        )
      })}

      {/* Reactor Pressure Vessel */}
      <Cylinder ref={addMeshRef} args={[14, 14, 8, 32]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.1} transparent opacity={0.6} />
      </Cylinder>

      {/* Instrumentation and Monitoring */}
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 13
        return (
          <Box
            key={`instrument-${i}`}
            ref={addMeshRef}
            args={[0.2, 0.2, 0.8]}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            castShadow
          >
            <meshStandardMaterial
              color="#22c55e"
              metalness={0.7}
              roughness={0.3}
              emissive="#16a34a"
              emissiveIntensity={0.3}
            />
          </Box>
        )
      })}

      {/* Labels and Annotations */}
      <Text position={[0, 12, 0]} fontSize={1.5} color="#22c55e" anchorX="center" anchorY="middle">
        Reactor Core Assembly
      </Text>

      <Text position={[0, -8, 0]} fontSize={0.8} color="#6b7280" anchorX="center" anchorY="middle">
        {pressureTubes.length} Pressure Tubes • {controlRods.length} Control Rods
      </Text>

      <Text position={[0, -9.5, 0]} fontSize={0.6} color="#9ca3af" anchorX="center" anchorY="middle">
        Heavy Water Moderated & Cooled • Educational Schematic
      </Text>
    </group>
  )
}
