'use client'

import React, { useEffect, useRef } from 'react'

export function SVMVisualisation({ kernel, C }: { kernel: string, C: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Generate fixed points
    const points: { x: number, y: number, class: number }[] = []
    let seed = 42
    const random = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    // Class 0 (Blue) - Bottom Left
    for (let i = 0; i < 20; i++) {
      points.push({
        x: random() * (canvas.width * 0.6),
        y: random() * (canvas.height * 0.6) + canvas.height * 0.4,
        class: 0
      })
    }
    // Class 1 (Red) - Top Right
    for (let i = 0; i < 20; i++) {
      points.push({
        x: random() * (canvas.width * 0.6) + canvas.width * 0.4,
        y: random() * (canvas.height * 0.6),
        class: 1
      })
    }

    // Draw background heatmap/contour based on kernel
    const imgData = ctx.createImageData(canvas.width, canvas.height)
    const data = imgData.data

    for (let x = 0; x < canvas.width; x += 2) {
      for (let y = 0; y < canvas.height; y += 2) {
        let val = 0
        if (kernel === 'linear') {
          // Linear boundary: y = -x + const
          // C controls the width of the margin
          const margin = 100 / Math.pow(C, 0.3)
          const dist = (x + y - canvas.width) / margin
          val = Math.max(-1, Math.min(1, dist))
        } else {
          // RBF boundary: non-linear
          const cx = canvas.width * 0.7
          const cy = canvas.height * 0.3
          const margin = 150 / Math.pow(C, 0.4)
          const dist = (Math.hypot(x - cx, y - cy) - 50) / margin
          val = Math.max(-1, Math.min(1, dist))
        }

        // Color based on val (-1 to 1)
        const alpha = Math.abs(val) * 100
        const r = val > 0 ? 239 : 14
        const g = val > 0 ? 68 : 165
        const b = val > 0 ? 68 : 233

        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            const idx = ((y + dy) * canvas.width + (x + dx)) * 4
            data[idx] = r
            data[idx + 1] = g
            data[idx + 2] = b
            data[idx + 3] = alpha
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0)

    // Draw points
    points.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = p.class === 0 ? '#0ea5e9' : '#ef4444'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#334155'
      ctx.stroke()
    })

    // Draw solid decision boundary
    ctx.beginPath()
    if (kernel === 'linear') {
      ctx.moveTo(0, canvas.height)
      ctx.lineTo(canvas.width, 0)
    } else {
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 50, 0, Math.PI * 2)
    }
    ctx.lineWidth = 2
    ctx.strokeStyle = '#0f172a'
    ctx.stroke()

    // Margin lines based on C
    const marginSize = 50 / Math.pow(C, 0.3)
    ctx.beginPath()
    if (kernel === 'linear') {
      ctx.moveTo(0, canvas.height - marginSize * 1.4)
      ctx.lineTo(canvas.width - marginSize * 1.4, 0)
      ctx.moveTo(marginSize * 1.4, canvas.height)
      ctx.lineTo(canvas.width, marginSize * 1.4)
    } else {
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 50 + marginSize, 0, Math.PI * 2)
      ctx.moveTo(canvas.width * 0.7 + Math.max(1, 50 - marginSize), canvas.height * 0.3)
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, Math.max(1, 50 - marginSize), 0, Math.PI * 2)
    }
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#64748b'
    ctx.stroke()
    ctx.setLineDash([])

  }, [kernel, C])

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Dynamic SVM Visualisation</div>
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240} 
        className="border border-border-subtle rounded-md bg-white shadow-sm"
      />
      <div className="text-[10px] text-muted-foreground mt-2 max-w-[240px] text-center leading-tight">
        {kernel === 'linear' 
          ? `Linear boundary. C=${C} controls the margin width. High C means tighter margins.`
          : `Non-linear (RBF) boundary wrapping clusters. C=${C} determines boundary rigidity.`}
      </div>
    </div>
  )
}
