"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useNuclearStore } from "@/lib/store"

const tourSteps = [
  {
    title: "Welcome to Atucha II",
    description: "Argentina's third nuclear power reactor and first Siemens PHWR design",
    cameraPosition: [50, 30, 50],
    cameraTarget: [0, 15, 0],
    view: "overview" as const,
    content:
      "Atucha II is a unique Siemens-designed Pressurized Heavy Water Reactor (PHWR) located in Lima, Buenos Aires Province, Argentina. With a net capacity of 693 MWe, it represents a significant achievement in nuclear technology.",
  },
  {
    title: "Reactor Containment",
    description: "Reinforced concrete containment structure with steel dome",
    cameraPosition: [25, 25, 25],
    cameraTarget: [0, 15, 0],
    view: "overview" as const,
    content:
      "The containment building houses the reactor and provides multiple barriers against radiation release. The reinforced concrete structure with its distinctive dome is designed to withstand extreme conditions.",
  },
  {
    title: "PHWR Reactor Core",
    description: "Heavy water moderated and cooled reactor with pressure tubes",
    cameraPosition: [15, 10, 15],
    cameraTarget: [0, 5, 0],
    view: "reactor" as const,
    content:
      "The reactor core contains 451 pressure tubes arranged in a square lattice within the calandria vessel. Heavy water serves as both moderator and coolant, allowing the use of natural uranium fuel.",
  },
  {
    title: "Pressure Tube System",
    description: "Individual pressure tubes containing fuel bundles",
    cameraPosition: [8, 5, 8],
    cameraTarget: [0, 0, 0],
    view: "reactor" as const,
    content:
      "Each pressure tube contains 12 fuel bundles. The pressure tubes are made of zirconium alloy and operate at high pressure and temperature, allowing efficient heat transfer to the steam generators.",
  },
  {
    title: "Control Room Operations",
    description: "Main control room with advanced monitoring systems",
    cameraPosition: [0, 3, 8],
    cameraTarget: [0, 2, 0],
    view: "control-room" as const,
    content:
      "The control room features state-of-the-art monitoring and control systems. Operators monitor reactor parameters, control rod positions, and safety systems from this central location.",
  },
  {
    title: "Safety Systems",
    description: "Multiple independent safety systems ensure safe operation",
    cameraPosition: [-5, 3, 5],
    cameraTarget: [-12, 2, -5],
    view: "control-room" as const,
    content:
      "Atucha II incorporates multiple safety systems including emergency core cooling, containment spray systems, and redundant shutdown systems to ensure safe operation under all conditions.",
  },
]

export function TourManager() {
  const { tourActive, tourStep, nextTourStep, endTour, setView } = useNuclearStore()

  const currentStep = tourSteps[tourStep] || tourSteps[0]
  const progress = ((tourStep + 1) / tourSteps.length) * 100

  useEffect(() => {
    if (tourActive && currentStep) {
      // Set view
      setView(currentStep.view)

      // Store camera target in store for the 3D component to use
      useNuclearStore.setState({
        tourCameraTarget: {
          position: currentStep.cameraPosition,
          target: currentStep.cameraTarget,
        },
      })
    }
  }, [tourActive, tourStep, currentStep, setView])

  if (!tourActive) return null

  const handleNext = () => {
    if (tourStep < tourSteps.length - 1) {
      nextTourStep()
    } else {
      endTour()
    }
  }

  const handlePrevious = () => {
    if (tourStep > 0) {
      useNuclearStore.setState({ tourStep: tourStep - 1 })
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Step {tourStep + 1} of {tourSteps.length}
              </Badge>
              <Progress value={progress} className="w-20 h-2" />
            </div>
            <Button variant="ghost" size="sm" onClick={endTour} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
          <CardTitle className="text-base">{currentStep.title}</CardTitle>
          <CardDescription className="text-sm">{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.content}</p>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={tourStep === 0}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {tourStep + 1} / {tourSteps.length}
              </span>
            </div>

            <Button variant="default" size="sm" onClick={handleNext} className="gap-2">
              {tourStep === tourSteps.length - 1 ? "Finish" : "Next"}
              {tourStep !== tourSteps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
