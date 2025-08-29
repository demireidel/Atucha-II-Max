"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, Thermometer, Atom, Gauge, Droplets } from "lucide-react"

export function FallbackView() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Atucha II Nuclear Power Plant</h1>
          </div>
          <p className="text-muted-foreground">2D Technical Overview</p>
          <div className="flex justify-center gap-2">
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

        {/* Plant Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Atom className="h-5 w-5" />
              Reactor Specifications
            </CardTitle>
            <CardDescription>Siemens-designed Pressurized Heavy Water Reactor (PHWR)</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Capacity:</span>
                <span className="font-mono">693 MWe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Capacity:</span>
                <span className="font-mono">745 MWe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thermal Power:</span>
                <span className="font-mono">2160 MWt</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pressure Tubes:</span>
                <span className="font-mono">451</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Control Rods:</span>
                <span className="font-mono">32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Steam Generators:</span>
                <span className="font-mono">4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Components */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Primary System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating Pressure:</span>
                <span className="font-mono">11.8 MPa</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating Temperature:</span>
                <span className="font-mono">310°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coolant Flow Rate:</span>
                <span className="font-mono">8,200 kg/s</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Heavy Water Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moderator:</span>
                <span className="font-mono">D₂O</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coolant:</span>
                <span className="font-mono">D₂O</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moderator Temp:</span>
                <span className="font-mono">70°C</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Content */}
        <Card>
          <CardHeader>
            <CardTitle>About PHWR Technology</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              The Atucha II nuclear power plant uses Pressurized Heavy Water Reactor (PHWR) technology, designed by
              Siemens. This reactor type uses heavy water (D₂O) as both moderator and coolant, allowing it to use
              natural uranium fuel without enrichment.
            </p>
            <p>
              Key advantages of PHWR design include excellent neutron economy, on-power refueling capability, and the
              ability to use natural uranium fuel. The reactor core contains 451 pressure tubes arranged in a hexagonal
              lattice pattern within the calandria vessel.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
