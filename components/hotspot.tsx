"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html, Sphere, Ring } from "@react-three/drei"
import type { Group } from "three"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"

interface HotspotProps {
  position: [number, number, number]
  title: string
  description: string
  category: "safety" | "physics" | "operations" | "design"
  details: string
  sources?: string[]
}

export function Hotspot({ position, title, description, category, details, sources = [] }: HotspotProps) {
  const groupRef = useRef<Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { camera } = useThree()

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
      groupRef.current.scale.setScalar(pulse)

      // Billboard effect - always face camera
      groupRef.current.lookAt(camera.position)
    }
  })

  const getCategoryColor = () => {
    switch (category) {
      case "safety":
        return "#ef4444"
      case "physics":
        return "#3b82f6"
      case "operations":
        return "#22c55e"
      case "design":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const getCategoryIcon = () => {
    switch (category) {
      case "safety":
        return "🛡️"
      case "physics":
        return "⚛️"
      case "operations":
        return "⚙️"
      case "design":
        return "📐"
      default:
        return "ℹ️"
    }
  }

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        {/* Hotspot indicator */}
        <Sphere args={[0.3, 16, 16]}>
          <meshStandardMaterial
            color={getCategoryColor()}
            emissive={getCategoryColor()}
            emissiveIntensity={isHovered ? 0.6 : 0.3}
            transparent
            opacity={0.8}
          />
        </Sphere>

        {/* Pulsing ring */}
        <Ring args={[0.4, 0.6, 16]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color={getCategoryColor()} transparent opacity={isHovered ? 0.4 : 0.2} />
        </Ring>

        {/* Info popup */}
        {isOpen && (
          <Html position={[0, 1, 0]} center distanceFactor={10} occlude style={{ pointerEvents: "auto" }}>
            <Card className="w-80 max-w-sm bg-card/95 backdrop-blur-sm border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon()}</span>
                    <div>
                      <CardTitle className="text-sm font-medium">{title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">{details}</p>

                {sources.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium">Sources:</h4>
                    <div className="space-y-1">
                      {sources.map((source, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          <span>{source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Html>
        )}
      </group>
    </group>
  )
}
