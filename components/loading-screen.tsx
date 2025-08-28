"use client"

import { useProgress } from "@react-three/drei"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"

export function LoadingScreen() {
  const { progress, loaded, total } = useProgress()

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-96 bg-card/95 backdrop-blur-sm border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-8 w-8 text-primary animate-pulse" />
            <div className="text-center">
              <h2 className="text-xl font-bold">Loading Atucha II</h2>
              <p className="text-sm text-muted-foreground">Initializing 3D visualization</p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loading assets...</span>
              <span>
                {loaded} / {total}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Loading reactor models, textures, and interactive systems</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
