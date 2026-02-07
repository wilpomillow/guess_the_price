"use client"

import * as React from "react"

export default function NeonGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.45]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 30% 25%, black 0%, transparent 60%)"
        }}
      />
      <div
        className="absolute -inset-24 blur-3xl opacity-[0.55]"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(168,85,247,0.55), transparent 45%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.45), transparent 50%)"
        }}
      />
    </div>
  )
}
