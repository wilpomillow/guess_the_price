"use client"

import * as React from "react"

type Props = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  disabled?: boolean
}

export default function Slider({ value, min, max, step = 0.1, onChange, disabled }: Props) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-orange-500"
      aria-label="Price slider"
    />
  )
}
