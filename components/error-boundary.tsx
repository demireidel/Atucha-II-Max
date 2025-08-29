"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("3D Visualization Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full bg-background">
            <Card className="w-96 bg-card/95 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-base">3D Visualization Error</CardTitle>
                </div>
                <CardDescription>An error occurred while loading the nuclear plant visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded text-sm font-mono text-muted-foreground">
                  {this.state.error?.message || "Unknown error occurred"}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Possible solutions:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Check your graphics drivers are up to date</li>
                    <li>• Try reducing graphics quality in settings</li>
                    <li>• Ensure WebGL is supported in your browser</li>
                    <li>• Refresh the page to retry loading</li>
                  </ul>
                </div>

                <Button onClick={() => window.location.reload()} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Application
                </Button>
              </CardContent>
            </Card>
          </div>
        )
      )
    }

    return this.props.children
  }
}
