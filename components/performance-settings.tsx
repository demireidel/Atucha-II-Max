"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Settings, Monitor, Zap, Eye } from "lucide-react"
import { useNuclearStore } from "@/lib/store"

export function PerformanceSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    showPerformance,
    qualityLevel,
    enableShadows,
    enablePostProcessing,
    lodDistance,
    togglePerformance,
    setQualityLevel,
    setEnableShadows,
    setEnablePostProcessing,
    setLodDistance,
  } = useNuclearStore()

  const getQualityLabel = (level: number) => {
    if (level <= 1) return "Low"
    if (level <= 2) return "Medium"
    if (level <= 3) return "High"
    return "Ultra"
  }

  const getQualityColor = (level: number) => {
    if (level <= 1) return "destructive"
    if (level <= 2) return "secondary"
    if (level <= 3) return "default"
    return "default"
  }

  if (!isOpen) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2 bg-transparent">
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    )
  }

  return (
    <Card className="w-80 bg-card/95 backdrop-blur-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-base">Performance Settings</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            ×
          </Button>
        </div>
        <CardDescription>Adjust graphics quality and performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Graphics Quality</span>
            <Badge variant={getQualityColor(qualityLevel) as any}>{getQualityLabel(qualityLevel)}</Badge>
          </div>
          <Slider
            value={[qualityLevel]}
            onValueChange={(value) => setQualityLevel(value[0])}
            max={4}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Ultra</span>
          </div>
        </div>

        <Separator />

        {/* Individual Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Shadows</span>
            </div>
            <Switch checked={enableShadows} onCheckedChange={setEnableShadows} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Post Processing</span>
            </div>
            <Switch checked={enablePostProcessing} onCheckedChange={setEnablePostProcessing} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="text-sm">Performance Monitor</span>
            </div>
            <Switch checked={showPerformance} onCheckedChange={togglePerformance} />
          </div>
        </div>

        <Separator />

        {/* LOD Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Detail Distance</span>
            <span className="text-xs text-muted-foreground">{lodDistance}m</span>
          </div>
          <Slider
            value={[lodDistance]}
            onValueChange={(value) => setLodDistance(value[0])}
            max={200}
            min={50}
            step={10}
            className="w-full"
          />
        </div>

        <Separator />

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQualityLevel(1)
              setEnableShadows(false)
              setEnablePostProcessing(false)
              setLodDistance(50)
            }}
          >
            Performance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQualityLevel(4)
              setEnableShadows(true)
              setEnablePostProcessing(true)
              setLodDistance(200)
            }}
          >
            Quality
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
