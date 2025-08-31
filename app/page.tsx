"use client"

import { Suspense, useState, useCallback, useEffect } from "react"
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

const EffectComposer = dynamic(
  () => import("@react-three/postprocessing").then((mod) => ({ default: mod.EffectComposer })),
  {
    ssr: false,
  },
)

const Bloom = dynamic(() => import("@react-three/postprocessing").then((mod) => ({ default: mod.Bloom })), {
  ssr: false,
})

const ToneMapping = dynamic(() => import("@react-three/postprocessing").then((mod) => ({ default: mod.ToneMapping })), {
  ssr: false,
})

const Vignette = dynamic(() => import("@react-three/postprocessing").then((mod) => ({ default: mod.Vignette })), {
  ssr: false,
})

const ChromaticAberration = dynamic(
  () => import("@react-three/postprocessing").then((mod) => ({ default: mod.ChromaticAberration })),
  {
    ssr: false,
  },
)

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
      useNuclearStore.getState().setQualityLevel(2)
      console.log("[v0] Set quality to medium for mobile/limited hardware")
    } else if (capabilities.maxTextureSize < 4096) {
      useNuclearStore.getState().setQualityLevel(4)
      console.log("[v0] Set quality to high for mid-range hardware")
    } else {
      useNuclearStore.getState().setQualityLevel(5)
      console.log("[v0] Ultra-high quality enabled for high-end hardware")
    }
  }, [])

  const shadowMapSize = webglCapabilities?.maxTextureSize
    ? Math.min(
        qualityLevel >= 4 ? 4096 : qualityLevel >= 3 ? 2048 : qualityLevel >= 2 ? 1024 : 512,
        webglCapabilities.maxTextureSize / 2,
      )
    : 1024

  const pixelRatio =
    isClient && typeof window !== "undefined"
      ? Math.min(qualityLevel >= 4 ? 2.5 : qualityLevel >= 3 ? 2 : 1, window.devicePixelRatio || 1)
      : 1

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
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    failIfMajorPerformanceCaveat: false,
                    preserveDrawingBuffer: false,
                    stencil: true,
                    depth: true,
                    logarithmicDepthBuffer: qualityLevel >= 4,
                    precision: "highp",
                  }}
                  onCreated={({ gl, scene, camera }) => {
                    try {
                      if (gl && typeof gl.getParameter === "function") {
                        gl.shadowMap.enabled = enableShadows
                        gl.shadowMap.type = qualityLevel >= 4 ? 2 : 1 // PCF or Basic
                        gl.outputColorSpace = "srgb"
                        gl.toneMapping = 4 // ACESFilmicToneMapping
                        gl.toneMappingExposure = 1.2
                        gl.physicallyCorrectLights = true

                        // Enable anisotropic filtering if available
                        const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic")
                        if (anisotropy) {
                          const maxAnisotropy = gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
                          gl.maxAnisotropy = Math.min(16, maxAnisotropy)
                        }

                        console.log("[v0] Maximum quality renderer initialized")
                      }
                    } catch (error) {
                      console.warn("[v0] Canvas context info unavailable:", error)
                    }
                  }}
                >
                  <Suspense fallback={null}>
                    <Preload all />

                    <ambientLight intensity={0.3} color="#f1f5f9" />

                    {/* Primary sun light */}
                    <directionalLight
                      position={[100, 120, 60]}
                      intensity={2.5}
                      color="#ffffff"
                      castShadow={enableShadows}
                      shadow-mapSize-width={shadowMapSize}
                      shadow-mapSize-height={shadowMapSize}
                      shadow-camera-far={500}
                      shadow-camera-left={-120}
                      shadow-camera-right={120}
                      shadow-camera-top={120}
                      shadow-camera-bottom={-120}
                      shadow-bias={-0.00005}
                      shadow-normalBias={0.02}
                      shadow-radius={qualityLevel >= 4 ? 8 : 4}
                    />

                    {/* Secondary fill lights for realistic illumination */}
                    <directionalLight position={[-80, 60, -40]} intensity={1.2} color="#e0f2fe" />
                    <directionalLight position={[40, 80, -80]} intensity={1.0} color="#fef3c7" />
                    <directionalLight position={[0, 40, 100]} intensity={0.8} color="#f0f9ff" />

                    {/* Accent lighting for depth */}
                    <pointLight position={[0, 50, 0]} intensity={1.5} color="#ffffff" distance={200} decay={2} />
                    <spotLight
                      position={[60, 80, 60]}
                      intensity={2.0}
                      angle={Math.PI / 6}
                      penumbra={0.5}
                      color="#ffffff"
                      castShadow={enableShadows && qualityLevel >= 3}
                      shadow-mapSize-width={shadowMapSize / 2}
                      shadow-mapSize-height={shadowMapSize / 2}
                    />

                    <Environment preset="warehouse" background={false} environmentIntensity={0.8} />

                    <Grid
                      args={[300, 300]}
                      position={[0, -0.05, 0]}
                      cellSize={2.5}
                      cellThickness={0.8}
                      cellColor="#10b981"
                      sectionSize={25}
                      sectionThickness={1.5}
                      sectionColor="#059669"
                      fadeDistance={150}
                      fadeStrength={0.8}
                      infiniteGrid={true}
                    />

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
                      minDistance={8}
                      maxDistance={300}
                      maxPolarAngle={Math.PI / 2.1}
                      enableDamping={true}
                      dampingFactor={0.05}
                      rotateSpeed={0.8}
                      zoomSpeed={1.2}
                      panSpeed={1.0}
                      enabled={!tourActive && (typeof window !== "undefined" ? window.innerWidth >= 768 : true)}
                    />

                    {qualityLevel >= 3 && (
                      <EffectComposer>
                        <Bloom
                          intensity={0.4}
                          luminanceThreshold={0.8}
                          luminanceSmoothing={0.9}
                          mipmapBlur={true}
                          levels={qualityLevel >= 4 ? 9 : 6}
                          kernelSize={qualityLevel >= 4 ? 5 : 3}
                        />
                        <ToneMapping
                          adaptive={true}
                          resolution={qualityLevel >= 4 ? 512 : 256}
                          middleGrey={0.6}
                          maxLuminance={16.0}
                          averageLuminance={1.0}
                          adaptationRate={2.0}
                        />
                        {qualityLevel >= 4 && (
                          <>
                            <Vignette offset={0.15} darkness={0.3} eskil={false} />
                            <ChromaticAberration
                              offset={[0.0005, 0.0012]}
                              radialModulation={true}
                              modulationOffset={0.15}
                            />
                          </>
                        )}
                      </EffectComposer>
                    )}

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
