"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Menu, Zap, Thermometer, Gauge, Activity, Shield, Eye, Camera, BookOpen } from "lucide-react"
import { useNuclearStore } from "@/lib/store"

export function MobileControls() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    reactorTemperature,
    reactorPressure,
    powerOutput,
    currentView,
    setView,
    startTour,
    isPlaying,
    togglePlayback,
  } = useNuclearStore()

  return (
    <>
      {/* Mobile Control Button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Atucha II Controls
              </SheetTitle>
              <SheetDescription>Plant status and navigation controls</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={togglePlayback} variant={isPlaying ? "default" : "outline"} className="gap-2">
                    <Activity className="h-4 w-4" />
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button onClick={startTour} variant="secondary" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Tour
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Plant Status */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Plant Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reactorTemperature}°C</div>
                      <Progress value={75} className="h-1 w-16" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Pressure</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reactorPressure} MPa</div>
                      <Progress value={82} className="h-1 w-16" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Power Output</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{powerOutput} MWe</div>
                      <Progress value={93} className="h-1 w-16" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Safe
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Activity className="h-3 w-3" />
                    Operational
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* View Controls */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Views
                </h3>
                <div className="space-y-2">
                  <Button
                    variant={currentView === "overview" ? "default" : "outline"}
                    onClick={() => {
                      setView("overview")
                      setIsOpen(false)
                    }}
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                    Plant Overview
                  </Button>
                  <Button
                    variant={currentView === "reactor" ? "default" : "outline"}
                    onClick={() => {
                      setView("reactor")
                      setIsOpen(false)
                    }}
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <Zap className="h-4 w-4" />
                    Reactor Core
                  </Button>
                  <Button
                    variant={currentView === "control-room" ? "default" : "outline"}
                    onClick={() => {
                      setView("control-room")
                      setIsOpen(false)
                    }}
                    className="w-full justify-start gap-2"
                    size="sm"
                  >
                    <Activity className="h-4 w-4" />
                    Control Room
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-card/90 backdrop-blur-sm border-b border-border p-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3 text-orange-500" />
              <span>{reactorTemperature}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-3 w-3 text-blue-500" />
              <span>{reactorPressure} MPa</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-green-500" />
            <span className="font-semibold">{powerOutput} MWe</span>
          </div>
        </div>
      </div>
    </>
  )
}
