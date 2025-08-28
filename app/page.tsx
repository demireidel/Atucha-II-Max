"use client"

import { Suspense, useState, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Grid, Stats, Preload } from "@react-three/drei"
import { Perf } from "r3f-perf"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Zap, Shield, Thermometer } from "lucide-react"
import { NuclearPlant } from "@/components/nuclear-plant"
import { ControlPanel } from "@/components/control-panel"
import { InfoPanel } from "@/components/info-panel"
import { TourManager } from "@/components/tour-manager"
import { InteractiveElements } from "@/components/interactive-elements"
import { LoadingScreen } from "@/components/loading-screen"
import { ErrorBoundary } from "@/components/error-boundary"
import { PerformanceSettings } from "@/components/performance-settings"
import { WebGLDetector } from "@/components/webgl-detector"
import { FallbackView } from "@/components/fallback-view"
import { MobileControls } from "@/components/mobile-controls"
import { TouchControls } from "@/components/touch-controls"
import { useNuclearStore } from "@/lib/store"

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

  const handleCapabilitiesDetected = useCallback((capabilities: WebGLCapabilities) => {
    setWebglCapabilities(capabilities)

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile || capabilities.maxTextureSize < 2048) {
      useNuclearStore.getState().setQualityLevel(1) // Low quality for mobile/weak hardware
    } else if (capabilities.maxTextureSize < 4096) {
      useNuclearStore.getState().setQualityLevel(2) // Medium quality
    }
  }, [])

  const shadowMapSize = webglCapabilities?.maxTextureSize
    ? Math.min(qualityLevel >= 3 ? 2048 : qualityLevel >= 2 ? 1024 : 512, webglCapabilities.maxTextureSize / 2)
    : 512

  const pixelRatio =
    typeof window !== "undefined" ? Math.min(qualityLevel >= 4 ? 2 : 1, window.devicePixelRatio || 1) : 1

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
                    depth: true,
                  }}
                  frameloop="always"
                  legacy={false}
                >
                  <Suspense fallback={null}>
                    <Preload all />

                    {/* Lighting */}
                    <ambientLight intensity={0.3} />
                    {enableShadows && webglCapabilities?.extensions.includes("WEBGL_depth_texture") && (
                      <directionalLight
                        position={[100, 100, 50]}
                        intensity={1}
                        castShadow
                        shadow-mapSize-width={shadowMapSize}
                        shadow-mapSize-height={shadowMapSize}
                        shadow-camera-far={200}
                        shadow-camera-left={-50}
                        shadow-camera-right={50}
                        shadow-camera-top={50}
                        shadow-camera-bottom={-50}
                      />
                    )}

                    {/* Environment */}
                    <Environment preset="warehouse" />
                    <Grid
                      args={[200, 200]}
                      position={[0, -0.1, 0]}
                      cellSize={5}
                      cellThickness={0.5}
                      cellColor="#4ade80"
                      sectionSize={25}
                      sectionThickness={1}
                      sectionColor="#22c55e"
                      fadeDistance={100}
                      fadeStrength={1}
                    />

                    {/* Nuclear Plant Model */}
                    <NuclearPlant />

                    {/* Interactive Elements and Hotspots */}
                    {!tourActive && <InteractiveElements />}

                    <TouchControls />
                    <OrbitControls
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={10}
                      maxDistance={200}
                      maxPolarAngle={Math.PI / 2}
                      enabled={!tourActive && (typeof window !== "undefined" ? window.innerWidth >= 768 : true)}
                    />

                    {/* Performance Monitor */}
                    {showPerformance && <Perf position="top-left" />}
                    {showPerformance && <Stats />}
                  </Suspense>
                </Canvas>
              </ErrorBoundary>

              <Suspense fallback={<LoadingScreen />}>
                <div />
              </Suspense>

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
