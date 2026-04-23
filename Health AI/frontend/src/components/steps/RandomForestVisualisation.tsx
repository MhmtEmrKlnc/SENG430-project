'use client'

import React, { useEffect, useRef } from 'react'

export function RandomForestVisualisation({ nTrees, maxDepth }: { nTrees: number, maxDepth: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Visual cap for nTrees to avoid canvas lag, but conceptually represents the density
    const visualTrees = Math.min(60, Math.max(5, Math.floor(nTrees / 2)))

    // Seeded random
    let seed = 123
    const random = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    const drawMiniTree = (cx: number, cy: number, scale: number) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx, cy + 10 * scale)
      ctx.lineWidth = 1.5 * scale
      ctx.strokeStyle = '#475569'
      ctx.stroke()

      const drawBranch = (x: number, y: number, depth: number) => {
        if (depth > Math.min(3, maxDepth)) return
        ctx.beginPath()
        ctx.arc(x, y, 3 * scale, 0, Math.PI * 2)
        ctx.fillStyle = (depth % 2 === 0) ? '#0ea5e9' : '#ef4444'
        ctx.fill()
        
        if (depth < Math.min(3, maxDepth)) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x - 5 * scale, y + 8 * scale)
          ctx.stroke()
          drawBranch(x - 5 * scale, y + 8 * scale, depth + 1)

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + 5 * scale, y + 8 * scale)
          ctx.stroke()
          drawBranch(x + 5 * scale, y + 8 * scale, depth + 1)
        }
      }
      
      drawBranch(cx, cy, 1)
    }

    for (let i = 0; i < visualTrees; i++) {
      const x = random() * (canvas.width - 20) + 10
      const y = random() * (canvas.height - 40) + 10
      const scale = random() * 0.5 + 0.5
      drawMiniTree(x, y, scale)
    }

  }, [nTrees, maxDepth])

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Dynamic Random Forest Visualisation</div>
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240} 
        className="border border-border-subtle rounded-md bg-white shadow-sm"
      />
      <div className="text-[10px] text-muted-foreground mt-2 max-w-[240px] text-center leading-tight">
        Forest with {nTrees} trees. Each tree votes on the outcome. More trees = smoother decisions.
      </div>
    </div>
  )
}
