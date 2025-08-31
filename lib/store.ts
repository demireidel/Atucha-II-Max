import { create } from "zustand"

interface PerformanceMetrics {
  fps: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  objects: number
}

interface TourCameraTarget {
  position: [number, number, number]
  target: [number, number, number]
}

interface NuclearStore {
  // Simulation state
  isPlaying: boolean
  showPerformance: boolean

  // Plant parameters
  reactorTemperature: number
  reactorPressure: number
  powerOutput: number

  // View state
  currentView: "overview" | "reactor" | "control-room"
  tourActive: boolean
  tourStep: number
  tourCameraTarget: TourCameraTarget | null

  // Performance settings
  qualityLevel: number // 1-4 (Low, Medium, High, Ultra)
  enableShadows: boolean
  enablePostProcessing: boolean
  lodDistance: number

  performanceMetrics: PerformanceMetrics

  // Actions
  togglePlayback: () => void
  togglePerformance: () => void
  resetCamera: () => void
  setView: (view: "overview" | "reactor" | "control-room") => void
  startTour: () => void
  nextTourStep: () => void
  endTour: () => void

  setQualityLevel: (level: number) => void
  setEnableShadows: (enabled: boolean) => void
  setEnablePostProcessing: (enabled: boolean) => void
  setLodDistance: (distance: number) => void

  setPerformanceMetrics: (metrics: PerformanceMetrics) => void
}

export const useNuclearStore = create<NuclearStore>((set, get) => ({
  // Initial state
  isPlaying: false,
  showPerformance: false,

  // Plant parameters (realistic values for Atucha II)
  reactorTemperature: 310,
  reactorPressure: 11.8,
  powerOutput: 693,

  // View state
  currentView: "overview",
  tourActive: false,
  tourStep: 0,
  tourCameraTarget: null,

  // Performance settings
  qualityLevel: 3, // High by default
  enableShadows: true,
  enablePostProcessing: true,
  lodDistance: 100,

  performanceMetrics: {
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    objects: 0,
  },

  // Actions
  togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
  togglePerformance: () => set((state) => ({ showPerformance: !state.showPerformance })),
  resetCamera: () => {
    // This will be handled by the 3D scene
    console.log("Reset camera requested")
  },
  setView: (view) => set({ currentView: view }),
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  nextTourStep: () => set((state) => ({ tourStep: state.tourStep + 1 })),
  endTour: () => set({ tourActive: false, tourStep: 0, tourCameraTarget: null }),

  setQualityLevel: (level) => set({ qualityLevel: level }),
  setEnableShadows: (enabled) => set({ enableShadows: enabled }),
  setEnablePostProcessing: (enabled) => set({ enablePostProcessing: enabled }),
  setLodDistance: (distance) => set({ lodDistance: distance }),

  setPerformanceMetrics: (metrics) => set({ performanceMetrics: metrics }),
}))
