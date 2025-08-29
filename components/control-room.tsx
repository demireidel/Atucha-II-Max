"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Box, Plane, Cylinder } from "@react-three/drei"
import type { Group } from "three"
import { useNuclearStore } from "@/lib/store"

interface ControlRoomProps {
  position?: [number, number, number]
  scale?: number
}

export function ControlRoom({ position = [0, 0, 0], scale = 1 }: ControlRoomProps) {
  const groupRef = useRef<Group>(null)
  const { isPlaying, reactorTemperature, reactorPressure, powerOutput } = useNuclearStore()

  // Generate control panel indicators
  const indicators = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      id: i,
      status: Math.random() > 0.8 ? "alarm" : Math.random() > 0.3 ? "normal" : "warning",
      value: Math.random() * 100,
    }))
  }, [])

  useFrame((state, delta) => {
    if (isPlaying && groupRef.current) {
      // Subtle blinking animation for alarm indicators
      const blinkIntensity = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5
      // This would be used for alarm light animations
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Control Room Structure */}
      <group>
        {/* Floor */}
        <Box args={[30, 0.2, 20]} position={[0, -0.1, 0]} receiveShadow>
          <meshStandardMaterial color="#374151" metalness={0.1} roughness={0.9} />
        </Box>

        {/* Walls */}
        <Box args={[30, 8, 0.5]} position={[0, 4, -10]} receiveShadow>
          <meshStandardMaterial color="#f3f4f6" metalness={0.1} roughness={0.8} />
        </Box>
        <Box args={[0.5, 8, 20]} position={[-15, 4, 0]} receiveShadow>
          <meshStandardMaterial color="#f3f4f6" metalness={0.1} roughness={0.8} />
        </Box>
        <Box args={[0.5, 8, 20]} position={[15, 4, 0]} receiveShadow>
          <meshStandardMaterial color="#f3f4f6" metalness={0.1} roughness={0.8} />
        </Box>

        {/* Ceiling */}
        <Box args={[30, 0.3, 20]} position={[0, 8, 0]} receiveShadow>
          <meshStandardMaterial color="#e5e7eb" metalness={0.2} roughness={0.7} />
        </Box>
      </group>

      {/* Main Control Console (Horseshoe shaped) */}
      <group position={[0, 1.5, 2]}>
        {/* Central console */}
        <Box args={[8, 1.5, 2]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
        </Box>

        {/* Left wing */}
        <Box args={[6, 1.5, 1.5]} position={[-7, 0, 1.5]} rotation={[0, Math.PI / 6, 0]} castShadow>
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
        </Box>

        {/* Right wing */}
        <Box args={[6, 1.5, 1.5]} position={[7, 0, 1.5]} rotation={[0, -Math.PI / 6, 0]} castShadow>
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
        </Box>

        {/* Control panel surfaces */}
        <Plane args={[7.8, 1.8]} position={[0, 0.76, 0.9]} rotation={[-Math.PI / 6, 0, 0]}>
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
        </Plane>
      </group>

      {/* Operator Chairs */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={`chair-${i}`} position={[-4 + i * 4, 0.5, 5]}>
          {/* Chair base */}
          <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 0.05, 0]}>
            <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
          </Cylinder>
          {/* Chair seat */}
          <Box args={[0.8, 0.1, 0.8]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.8} />
          </Box>
          {/* Chair back */}
          <Box args={[0.8, 1, 0.1]} position={[0, 1, -0.35]}>
            <meshStandardMaterial color="#1f2937" metalness={0.2} roughness={0.8} />
          </Box>
        </group>
      ))}

      {/* Large Display Screens */}
      <group position={[0, 4, -9.5]}>
        {/* Main mimic diagram screen */}
        <Box args={[12, 6, 0.3]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
        </Box>
        <Plane args={[11.5, 5.5]} position={[0, 0, 0.16]}>
          <meshStandardMaterial color="#0f172a" emissive="#1e40af" emissiveIntensity={0.3} />
        </Plane>

        {/* Side monitoring screens */}
        <Box args={[4, 3, 0.2]} position={[-8, -1, 0]} castShadow>
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
        </Box>
        <Plane args={[3.8, 2.8]} position={[-8, -1, 0.11]}>
          <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.2} />
        </Plane>

        <Box args={[4, 3, 0.2]} position={[8, -1, 0]} castShadow>
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
        </Box>
        <Plane args={[3.8, 2.8]} position={[8, -1, 0.11]}>
          <meshStandardMaterial color="#0f172a" emissive="#f59e0b" emissiveIntensity={0.2} />
        </Plane>
      </group>

      {/* Control Panel Indicators and Switches */}
      {indicators.map((indicator, index) => {
        const row = Math.floor(index / 8)
        const col = index % 8
        const x = -3.5 + col * 1
        const z = 0.5 + row * 0.3

        let color = "#22c55e" // normal
        let emissiveIntensity = 0.3

        if (indicator.status === "alarm") {
          color = "#ef4444"
          emissiveIntensity = 0.6
        } else if (indicator.status === "warning") {
          color = "#f59e0b"
          emissiveIntensity = 0.4
        }

        return (
          <group key={indicator.id} position={[x, 2.2, z]}>
            {/* Indicator light */}
            <Cylinder args={[0.05, 0.05, 0.02, 8]} position={[0, 0, 0]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} />
            </Cylinder>

            {/* Switch/button */}
            <Box args={[0.08, 0.08, 0.04]} position={[0, -0.1, 0]}>
              <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.3} />
            </Box>
          </group>
        )
      })}

      {/* Safety System Panels */}
      <group position={[-12, 2, -5]}>
        <Box args={[2, 4, 0.3]} castShadow>
          <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.7} />
        </Box>

        {/* Emergency shutdown buttons */}
        {Array.from({ length: 4 }, (_, i) => (
          <Cylinder key={i} args={[0.15, 0.15, 0.05, 16]} position={[0, 1 - i * 0.5, 0.2]}>
            <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.4} />
          </Cylinder>
        ))}
      </group>

      {/* Computer Workstations */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`workstation-${i}`} position={[-10 + i * 7, 1, 6]}>
          {/* Desk */}
          <Box args={[2, 0.1, 1.5]} position={[0, 0, 0]} castShadow>
            <meshStandardMaterial color="#6b7280" metalness={0.2} roughness={0.8} />
          </Box>

          {/* Monitor */}
          <Box args={[0.8, 0.6, 0.1]} position={[0, 0.8, -0.5]} castShadow>
            <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.2} />
          </Box>
          <Plane args={[0.75, 0.55]} position={[0, 0.8, -0.45]}>
            <meshStandardMaterial color="#0f172a" emissive="#3b82f6" emissiveIntensity={0.2} />
          </Plane>

          {/* Keyboard */}
          <Box args={[0.6, 0.02, 0.2]} position={[0, 0.06, 0.3]}>
            <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.6} />
          </Box>
        </group>
      ))}

      {/* Overhead Lighting */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`light-${i}`} position={[-10 + i * 4, 7.5, 0]}>
          <Box args={[1.5, 0.2, 0.5]} castShadow>
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </Box>
        </group>
      ))}

      {/* Status Display Boards */}
      <group position={[12, 4, -2]}>
        <Box args={[0.3, 6, 4]} castShadow>
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
        </Box>

        {/* Digital displays */}
        {Array.from({ length: 8 }, (_, i) => (
          <Plane key={i} args={[0.25, 0.6]} position={[0.16, 2.5 - i * 0.7, -1.5 + (i % 2) * 3]}>
            <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.4} />
          </Plane>
        ))}
      </group>

      {/* Labels and Information */}
      <Text position={[0, 6, -8]} fontSize={1} color="#22c55e" anchorX="center" anchorY="middle">
        Atucha II Control Room
      </Text>

      <Text position={[0, 5.2, -8]} fontSize={0.5} color="#6b7280" anchorX="center" anchorY="middle">
        Main Control Room • PHWR Operations Center
      </Text>

      {/* Real-time parameter displays */}
      <Text position={[-8, -0.5, 0.12]} fontSize={0.3} color="#22c55e" anchorX="center" anchorY="middle">
        {`TEMP: ${reactorTemperature}°C`}
      </Text>

      <Text position={[8, -0.5, 0.12]} fontSize={0.3} color="#f59e0b" anchorX="center" anchorY="middle">
        {`PWR: ${powerOutput} MWe`}
      </Text>

      <Text position={[0, 0.5, 0.16]} fontSize={0.4} color="#3b82f6" anchorX="center" anchorY="middle">
        REACTOR MIMIC DIAGRAM
      </Text>
    </group>
  )
}
