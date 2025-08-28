"use client"

import { useRef, useMemo, useEffect } from "react"
import { type InstancedMesh, Object3D, CylinderGeometry, MeshStandardMaterial } from "three"

interface InstancedFuelRodsProps {
  count: number
  positions: Array<[number, number, number]>
  highlighted?: boolean
}

export function InstancedFuelRods({ count, positions, highlighted = false }: InstancedFuelRodsProps) {
  const meshRef = useRef<InstancedMesh>(null)
  const tempObject = useMemo(() => new Object3D(), [])

  const geometry = useMemo(() => new CylinderGeometry(0.006, 0.006, 0.48, 8), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: highlighted ? "#ef4444" : "#dc2626",
        metalness: 0.6,
        roughness: 0.4,
        emissive: highlighted ? "#dc2626" : "#991b1b",
        emissiveIntensity: highlighted ? 0.4 : 0.2,
      }),
    [highlighted],
  )

  useEffect(() => {
    if (!meshRef.current) return

    positions.forEach((position, i) => {
      tempObject.position.set(...position)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, tempObject])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow />
}
