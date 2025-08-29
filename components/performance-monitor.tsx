"use client"

import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useNuclearStore } from "@/lib/store"

export function PerformanceMonitor() {
  const { gl, scene } = useThree()
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const { setPerformanceMetrics } = useNuclearStore()

  useFrame(() => {
    frameCount.current++

    if (frameCount.current % 60 === 0) {
      const now = performance.now()
      const fps = Math.round(60000 / (now - lastTime.current))
      lastTime.current = now

      const info = gl.info
      const drawCalls = info.render.calls
      const triangles = info.render.triangles
      const geometries = info.memory.geometries
      const textures = info.memory.textures

      setPerformanceMetrics({
        fps,
        drawCalls,
        triangles,
        geometries,
        textures,
        objects: scene.children.length,
      })

      info.reset()
    }
  })

  return null
}
