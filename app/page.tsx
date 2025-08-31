"use client"

import { Suspense, useState, useCallback, useEffect } from "react"
import { ACESFilmicToneMapping, SRGBColorSpace, PCFSoftShadowMap } from "three"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Shield, Thermometer } from "lucide-react"
import { ControlPanel } from "@/components/control-panel"
import { InfoPanel } from "@/components/info-panel"
import { TourManager } from "@/components/tour-manager"
import { LoadingScreen } from "@/components/loading-screen"
import { ErrorBoundary } from "@/components/error-boundary"
import { PerformanceSettings } from "@/components/performance-settings"
import { WebGLDetector } from "@/components/webgl-detector"
import { FallbackView } from "@/components/fallback-view"
import { MobileControls } from "@/components/mobile-controls"
import { useNuclearStore } from "@/lib/store"

const Canvas = dynamic(() => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

const OrbitControls = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })), {
  ssr: false,
})

const Environment = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Environment })), {
  ssr: false,
})

const Grid = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Grid })), {
  ssr: false,
})

const Stats = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Stats })), {
  ssr: false,
})

const Preload = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Preload })), {
  ssr: false,
})

const Perf = dynamic(() => import("r3f-perf").then((mod) => ({ default: mod.Perf })), {
  ssr: false,
})

const NuclearPlant = dynamic(
  () => import("@/components/nuclear-plant").then((mod) => ({ default: mod.NuclearPlant })),
  {
    ssr: false,
    loading: () => null,
  },
)

const InteractiveElements = dynamic(
  () => import("@/components/interactive-elements").then((mod) => ({ default: mod.InteractiveElements })),
  {
    ssr: false,
    loading: () => null,
  },
)

const TouchControls = dynamic(
  () => import("@/components/touch-controls").then((mod) => ({ default: mod.TouchControls })),
  {
    ssr: false,
    loading: () => null,
  },
)

const PerformanceMonitor = dynamic(
  () => import("@/components/performance-monitor").then((mod) => ({ default: mod.PerformanceMonitor })),
  {
    ssr: false,
    loading: () => null,
  },
)

const TourCameraController = dynamic(
  () => import("@/components/tour-camera-controller").then((mod) => ({ default: mod.TourCameraController })),
  {
    ssr: false,
    loading: () => null,
  },
)

const ContactShadows = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.ContactShadows })), {
  ssr: false,
})
const MeshReflectorMaterial = dynamic(
  () => import("@react-three/drei").then((mod) => ({ default: mod.MeshReflectorMaterial })),
  { ssr: false },
)

const EffectComposer = dynamic(
  () => import("@react-three/postprocessing").then((mod) => ({ default: mod.EffectComposer })),
  { ssr: false },
)
const Bloom = dynamic(() => import("@react-three/postprocessing").then((mod) => ({ default: mod.Bloom })), {
  ssr: false,
})
const Vignette = dynamic(
  () => import("@react-three/postprocessing").then((mod) => ({ default: mod.Vignette })),
  { ssr: false },
)

interface WebGLCapabilities {
  webgl: boolean
  webgl2: boolean
  maxTextureSize: number
  maxRenderbufferSize: number
  maxVertexUniforms: number
  maxFragmentUniforms: number
  extensions: string[]
}

export default function AtucharIIVisualization() {
  const {
    isPlaying,
    showPerformance,
    currentView,
    tourActive,
    enableShadows,
    enablePostProcessing,
    qualityLevel,
    togglePlayback,
    resetCamera,
  } = useNuclearStore()

  const [webglCapabilities, setWebglCapabilities] = useState<WebGLCapabilities | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsClient(true)
    try {
      console.log("[v0] Client-side initialization complete with updated R3F compatibility")
    } catch (error) {
      console.error("[v0] Client initialization error:", error)
      setHasError(true)
    }
  }, [])

  const handleCapabilitiesDetected = useCallback((capabilities: WebGLCapabilities) => {
    console.log("[v0] WebGL capabilities detected:", capabilities)
    setWebglCapabilities(capabilities)

    const isMobile =
      typeof navigator !== "undefined" &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile || capabilities.maxTextureSize < 2048) {
      useNuclearStore.getState().setQualityLevel(1)
      console.log("[v0] Set quality to low for mobile/limited hardware")
    } else if (capabilities.maxTextureSize < 4096) {
      useNuclearStore.getState().setQualityLevel(2)
      console.log("[v0] Set quality to medium for mid-range hardware")
    } else {
      console.log("[v0] High-end hardware detected, maintaining high quality")
    }
  }, [])

  const shadowMapSize = webglCapabilities?.maxTextureSize
    ? Math.min(qualityLevel >= 3 ? 2048 : qualityLevel >= 2 ? 1024 : 512, webglCapabilities.maxTextureSize / 2)
    : 512

  const pixelRatio =
    isClient && typeof window !== "undefined" ? Math.min(qualityLevel >= 4 ? 2 : 1, window.devicePixelRatio || 1) : 1

  if (!isClient || hasError) {
    return <LoadingScreen />
  }

  return (
    <WebGLDetector onCapabilitiesDetected={handleCapabilitiesDetected}>
      {!webglCapabilities?.webgl ? (
        <FallbackView />
      ) : (
        <div className="min-h-screen bg-background text-foreground">
          {/* Header - Hidden on mobile */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm hidden md:block">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-8 w-8 text-primary" />
                    <div>
                      <h1 className="text-2xl font-bold text-balance">Atucha II Nuclear Power Plant</h1>
                      <p className="text-sm text-muted-foreground">Interactive 3D Visualization</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      PHWR
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Thermometer className="h-3 w-3" />
                      745 MWe
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={togglePlayback} className="gap-2 bg-transparent">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetCamera} className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    Reset View
                  </Button>
                  <PerformanceSettings />
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex h-screen md:h-[calc(100vh-80px)]">
            {/* 3D Viewport */}
            <div className="flex-1 relative">
              <ErrorBoundary>
                <Canvas
                  camera={{ position: [50, 30, 50], fov: 60 }}
                  shadows={enableShadows && webglCapabilities?.extensions.includes("WEBGL_depth_texture")}
                  className="bg-background"
                  dpr={pixelRatio}
                  gl={{
                    antialias: qualityLevel >= 2 && webglCapabilities?.maxRenderbufferSize >= 1024,
                    alpha: false,
                    powerPreference: "high-performance",
                    failIfMajorPerformanceCaveat: false,
                    preserveDrawingBuffer: false,
                    stencil: false,
                  }}
                  onCreated={({ gl, camera }) => {
                    try {
                      const context = typeof (gl as any).getContext === "function" ? (gl as any).getContext() : null
                      if (context && typeof context.getParameter === "function") {
                        console.log("[v0] R3F Canvas initialized successfully")
                      } else {
                        console.log("[v0] R3F Canvas initialized (no direct WebGL context available)")
                      }
                      // Configure renderer outputs
                      try {
                        ;(gl as any).toneMapping = ACESFilmicToneMapping
                        ;(gl as any).outputColorSpace = SRGBColorSpace
                        if ("physicallyCorrectLights" in (gl as any)) {
                          ;(gl as any).physicallyCorrectLights = true
                        }
                        if ((gl as any).shadowMap) {
                          ;(gl as any).shadowMap.type = PCFSoftShadowMap
                        }
                        // Slightly increase exposure for clarity
                        if ("toneMappingExposure" in (gl as any)) {
                          ;(gl as any).toneMappingExposure = 1.1
                        }
                        camera.lookAt(0, 12, 0)
                      } catch {}
                    } catch (error) {
                      console.warn("[v0] Canvas context info unavailable:", error)
                    }
                  }}
                >
                  <Suspense fallback={null}>
                    <Preload all />

                    <color attach="background" args={["#0f172a"]} />

                    <hemisphereLight intensity={0.7} color="#e0f2fe" groundColor="#fef3c7" />
                    <ambientLight intensity={0.45} color="#f8fafc" />
                    <directionalLight
                      position={[50, 80, 30]}
                      intensity={1.6}
                      color="#ffffff"
                      castShadow={enableShadows}
                      shadow-mapSize-width={shadowMapSize}
                      shadow-mapSize-height={shadowMapSize}
                      shadow-camera-far={300}
                      shadow-camera-left={-80}
                      shadow-camera-right={80}
                      shadow-camera-top={80}
                      shadow-camera-bottom={-80}
                      shadow-bias={-0.0001}
                    />
                    {/* Additional fill light */}
                    <directionalLight position={[-30, 40, -20]} intensity={0.6} color="#e0f2fe" />
                    {/* Rim light for better definition */}
                    <directionalLight position={[0, 20, -50]} intensity={0.8} color="#fef3c7" />

                    {/* Environment */}
                    <Environment preset="warehouse" />
                    <Grid
                      args={[200, 200]}
                      position={[0, -0.1, 0]}
                      cellSize={5}
                      cellThickness={0.4}
                      cellColor="#22c55e"
                      sectionSize={25}
                      sectionThickness={1}
                      sectionColor="#22c55e"
                      fadeDistance={100}
                      fadeStrength={1}
                    />

                    <ContactShadows position={[0, -0.05, 0]} opacity={0.65} scale={140} blur={2} far={80} />

                    {/* Subtle reflective ground for grounding objects */}
                    <mesh position={[0, -0.051, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                      <planeGeometry args={[200, 200]} />
                      <MeshReflectorMaterial
                        mirror={0.2}
                        blur={[150, 40]}
                        mixBlur={0.5}
                        mixStrength={1}
                        roughness={0.9}
                        metalness={0}
                        depthScale={0.2}
                        minDepthThreshold={0.9}
                        maxDepthThreshold={1}
                        color="#0b1220"
                      />
                    </mesh>

                    {enablePostProcessing && (
                      <EffectComposer>
                        <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.1} radius={0.5} />
                        <Vignette eskil={false} offset={0.18} darkness={0.5} />
                      </EffectComposer>
                    )}

                    {/* Nuclear Plant Model */}
                    <NuclearPlant />

                    {/* Interactive Elements and Hotspots */}
                    {!tourActive && <InteractiveElements />}

                    <TourCameraController />

                    <TouchControls />
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={10}
                      maxDistance={200}
                      maxPolarAngle={Math.PI / 2}
                      target={[0, 12, 0]}
                      makeDefault
                      enabled={!tourActive && (typeof window !== "undefined" ? window.innerWidth >= 768 : true)}
                    />

                    {/* Performance Monitor */}
                    <PerformanceMonitor />
                    {showPerformance && <Perf position="top-left" />}
                    {showPerformance && <Stats />}
                  </Suspense>
                </Canvas>
              </ErrorBoundary>

              <div className="absolute top-4 left-4 z-10 hidden md:block">
                <InfoPanel />
              </div>

              {/* Tour Manager */}
              <TourManager />
            </div>

            <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm hidden md:block">
              <ControlPanel />
            </div>
          </div>

          <MobileControls />
        </div>
      )}
    </WebGLDetector>
  )
}
