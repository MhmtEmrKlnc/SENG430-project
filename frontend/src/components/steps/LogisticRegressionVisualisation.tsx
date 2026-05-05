'use client'

import React, { useEffect, useRef } from 'react'

export function LogisticRegressionVisualisation({ C, maxIter }: { C: number, maxIter: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(20, canvas.height - 20)
    ctx.lineTo(canvas.width - 20, canvas.height - 20) // X
    ctx.moveTo(20, canvas.height - 20)
    ctx.lineTo(20, 20) // Y
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw Sigmoid curve
    ctx.beginPath()
    
    // C determines the steepness. Higher C = steeper
    const steepness = Math.pow(C, 0.4) * 0.1
    const center = canvas.width / 2

    for (let x = 20; x < canvas.width - 20; x++) {
      const z = (x - center) * steepness
      const sig = 1 / (1 + Math.exp(-z))
      
      const y = canvas.height - 20 - sig * (canvas.height - 40)
      
      if (x === 20) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 3
    ctx.stroke()

    // Threshold line at 0.5
    ctx.beginPath()
    ctx.moveTo(20, canvas.height / 2)
    ctx.lineTo(canvas.width - 20, canvas.height / 2)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash([])

    // Draw points indicating probability
    let seed = 42
    const random = () => {
      const x = Math.sin(seed++) * 10000
      return x - Math.floor(x)
    }

    for (let i = 0; i < 20; i++) {
      const x = random() * (canvas.width - 60) + 30
      const z = (x - center) * steepness
      const sig = 1 / (1 + Math.exp(-z))
      const y = canvas.height - 20 - sig * (canvas.height - 40)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = sig > 0.5 ? '#ef4444' : '#0ea5e9'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Optimization iteration path visual effect
    const iters = Math.min(50, Math.floor(maxIter / 10))
    for (let i = 0; i < iters; i++) {
      ctx.beginPath()
      ctx.arc(30 + i * 3, canvas.height - 10, 2, 0, Math.PI * 2)
      ctx.fillStyle = '#64748b'
      ctx.fill()
    }

  }, [C, maxIter])

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Dynamic Sigmoid Visualisation</div>
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240} 
        className="border border-border-subtle rounded-md bg-white shadow-sm"
      />
      <div className="text-[10px] text-muted-foreground mt-2 max-w-[240px] text-center leading-tight">
        S-Curve representing probability. Higher C makes the curve steeper, separating classes more strictly.
      </div>
    </div>
  )
}
