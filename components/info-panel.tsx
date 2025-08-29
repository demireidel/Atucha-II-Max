"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, MapPin } from "lucide-react"

export function InfoPanel() {
  return (
    <Card className="w-80 bg-card/90 backdrop-blur-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium">Plant Information</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>Lima, Buenos Aires Province, Argentina</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              Commercial Operation: 2014
            </Badge>
            <Badge variant="outline" className="text-xs">
              Siemens Design
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Atucha II is Argentina's third nuclear power reactor and the first Siemens-designed PHWR to enter commercial
            operation. It uses heavy water as both moderator and coolant.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
