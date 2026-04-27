'use client'

import React, { useEffect, useRef } from 'react'

export function DecisionTreeVisualisation({ maxDepth }: { maxDepth: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const drawTree = (x: number, y: number, depth: number, currentDepth: number, width: number) => {
      if (currentDepth > depth || currentDepth > 5) return // Cap visual depth at 5 to prevent overcrowding
      
      const isLeaf = currentDepth === depth || currentDepth === 5
      
      // Draw node
      ctx.beginPath()
      if (isLeaf) {
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = (x + y * currentDepth) % 2 > 1 ? '#0ea5e9' : '#ef4444' // Pseudo-random class color
      } else {
        ctx.rect(x - 8, y - 6, 16, 12)
        ctx.fillStyle = '#cbd5e1'
      }
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#334155'
      ctx.stroke()

      // Draw branches
      if (!isLeaf) {
        const nextY = y + 35
        const offset = width / 2
        
        ctx.beginPath()
        ctx.moveTo(x, y + 6)
        ctx.lineTo(x - offset, nextY - 6)
        ctx.stroke()
        drawTree(x - offset, nextY, depth, currentDepth + 1, width / 2)

        ctx.beginPath()
        ctx.moveTo(x, y + 6)
        ctx.lineTo(x + offset, nextY - 6)
        ctx.stroke()
        drawTree(x + offset, nextY, depth, currentDepth + 1, width / 2)
      }
    }

    // Root
    drawTree(canvas.width / 2, 20, maxDepth, 1, canvas.width / 2.5)

  }, [maxDepth])

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Dynamic Decision Tree Visualisation</div>
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240} 
        className="border border-border-subtle rounded-md bg-white shadow-sm"
      />
      <div className="text-[10px] text-muted-foreground mt-2 max-w-[240px] text-center leading-tight">
        Depth: {maxDepth}. Limits how many sequential questions the tree can ask. (Visual cap at depth 5).
      </div>
    </div>
  )
}
