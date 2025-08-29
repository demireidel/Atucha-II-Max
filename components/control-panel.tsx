"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Zap, Thermometer, Gauge, Activity, Shield, AlertTriangle, Eye, Camera, BookOpen } from "lucide-react"
import { useNuclearStore } from "@/lib/store"

export function ControlPanel() {
  const { reactorTemperature, reactorPressure, powerOutput, currentView, setView, startTour } = useNuclearStore()

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Plant Status
          </CardTitle>
          <CardDescription>Real-time operational parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Temperature</span>
              </div>
              <div className="text-2xl font-bold">{reactorTemperature}°C</div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Pressure</span>
              </div>
              <div className="text-2xl font-bold">{reactorPressure} MPa</div>
              <Progress value={82} className="h-2" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Power Output</span>
            </div>
            <div className="text-3xl font-bold text-primary">{powerOutput} MWe</div>
            <Progress value={93} className="h-2" />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            View Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={currentView === "overview" ? "default" : "outline"}
              onClick={() => setView("overview")}
              className="justify-start gap-2"
            >
              <Eye className="h-4 w-4" />
              Plant Overview
            </Button>
            <Button
              variant={currentView === "reactor" ? "default" : "outline"}
              onClick={() => setView("reactor")}
              className="justify-start gap-2"
            >
              <Zap className="h-4 w-4" />
              Reactor Core
            </Button>
            <Button
              variant={currentView === "control-room" ? "default" : "outline"}
              onClick={() => setView("control-room")}
              className="justify-start gap-2"
            >
              <Activity className="h-4 w-4" />
              Control Room
            </Button>
          </div>

          <Separator />

          <Button onClick={startTour} className="w-full gap-2" variant="secondary">
            <BookOpen className="h-4 w-4" />
            Start Guided Tour
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Type:</span>
            <span>Siemens PHWR</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Net Capacity:</span>
            <span>693 MWe</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Thermal Power:</span>
            <span>2160 MWt</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Moderator:</span>
            <span>Heavy Water</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Coolant:</span>
            <span>Heavy Water</span>
          </div>

          <Separator />

          <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              This is an educational visualization based on publicly available technical specifications. Not for
              operational use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
