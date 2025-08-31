"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface WebGLCapabilities {
  webgl: boolean
  webgl2: boolean
  maxTextureSize: number
  maxRenderbufferSize: number
  maxVertexUniforms: number
  maxFragmentUniforms: number
  extensions: string[]
}

interface WebGLDetectorProps {
  onCapabilitiesDetected: (capabilities: WebGLCapabilities) => void
  children: React.ReactNode
}

export function WebGLDetector({ onCapabilitiesDetected, children }: WebGLDetectorProps) {
  const [capabilities, setCapabilities] = useState<WebGLCapabilities | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [forceRender, setForceRender] = useState(false)

  useEffect(() => {
    const detectWebGL = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl =
          canvas.getContext("webgl", {
            failIfMajorPerformanceCaveat: false,
            antialias: false,
            alpha: false,
            depth: true,
            stencil: false,
            preserveDrawingBuffer: false,
          }) || canvas.getContext("experimental-webgl")

        if (!gl) {
          throw new Error("WebGL is not supported")
        }

        const checkContextReady = () => {
          try {
            // Test if gl.getParameter is available
            if (typeof gl.getParameter !== "function") {
              throw new Error("WebGL context not fully initialized")
            }

            const caps: WebGLCapabilities = {
              webgl: !!gl,
              webgl2: false, // Force WebGL 1.0 only
              maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 1024,
              maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 1024,
              maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128,
              maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 128,
              extensions: gl.getSupportedExtensions() || [],
            }

            // Check for minimum requirements
            if (caps.maxTextureSize < 1024) {
              throw new Error("Graphics hardware does not meet minimum requirements")
            }

            setCapabilities(caps)
            onCapabilitiesDetected(caps)

            setTimeout(() => canvas.remove(), 100)
          } catch (contextError) {
            console.error("[v0] WebGL context error:", contextError)
            throw contextError
          }
        }

        requestAnimationFrame(() => {
          try {
            checkContextReady()
          } catch (contextError) {
            setTimeout(() => {
              try {
                checkContextReady()
              } catch (finalError) {
                setError(finalError instanceof Error ? finalError.message : "WebGL context initialization failed")
                canvas.remove()
              }
            }, 100)
          }
        })
      } catch (err) {
        console.error("[v0] WebGL detection failed:", err)
        setError(err instanceof Error ? err.message : "Unknown WebGL error")
      }
    }

    detectWebGL()
  }, [onCapabilitiesDetected])

  // Show error fallback
  if (error && !forceRender) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>3D Visualization Not Available</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <p className="text-sm">This application requires WebGL support for 3D graphics. Please try:</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Updating your browser to the latest version</li>
                <li>Enabling hardware acceleration in browser settings</li>
                <li>Using a different browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Updating your graphics drivers</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} className="flex-1">
              Retry
            </Button>
            <Button variant="outline" onClick={() => setForceRender(true)} className="flex-1">
              Continue Anyway
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Alternative: View the 2D schematic version</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while detecting
  if (!capabilities && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Detecting graphics capabilities...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
