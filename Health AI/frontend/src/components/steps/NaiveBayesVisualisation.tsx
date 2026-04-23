'use client'

import React, { useEffect, useRef } from 'react'

export function NaiveBayesVisualisation() {
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
    ctx.lineTo(canvas.width - 20, canvas.height - 20)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    ctx.stroke()

    const drawGaussian = (mean: number, std: number, color: string, fillStr: string) => {
      ctx.beginPath()
      for (let x = 20; x < canvas.width - 20; x++) {
        // Normal distribution formula
        const exp = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)))
        const y = canvas.height - 20 - (exp * 150) // Scale height

        if (x === 20) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
      
      ctx.lineTo(canvas.width - 20, canvas.height - 20)
      ctx.lineTo(20, canvas.height - 20)
      ctx.fillStyle = fillStr
      ctx.fill()
    }

    // Class 0 distribution
    drawGaussian(80, 25, '#0ea5e9', 'rgba(14, 165, 233, 0.2)')
    
    // Class 1 distribution
    drawGaussian(160, 30, '#ef4444', 'rgba(239, 68, 68, 0.2)')

    // A specific data point being evaluated
    const pointX = 130
    ctx.beginPath()
    ctx.moveTo(pointX, canvas.height - 20)
    ctx.lineTo(pointX, 40)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])

    // Probabilities intersecting the curves
    ctx.beginPath()
    ctx.arc(pointX, canvas.height - 20 - (Math.exp(-Math.pow(pointX - 80, 2) / (2 * Math.pow(25, 2))) * 150), 5, 0, Math.PI * 2)
    ctx.fillStyle = '#0ea5e9'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(pointX, canvas.height - 20 - (Math.exp(-Math.pow(pointX - 160, 2) / (2 * Math.pow(30, 2))) * 150), 5, 0, Math.PI * 2)
    ctx.fillStyle = '#ef4444'
    ctx.fill()

  }, [])

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Naïve Bayes Visualisation</div>
      <canvas 
        ref={canvasRef} 
        width={240} 
        height={240} 
        className="border border-border-subtle rounded-md bg-white shadow-sm"
      />
      <div className="text-[10px] text-muted-foreground mt-2 max-w-[240px] text-center leading-tight">
        Compares the likelihood of a patient belonging to overlapping probability distributions (bell curves) for each class.
      </div>
    </div>
  )
}
