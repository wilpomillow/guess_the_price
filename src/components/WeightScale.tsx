"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Slider from "@/components/ui/Slider"
import { kgToLb, round1 } from "@/lib/units"

type Dot = { kg: number }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

// Keep the slider + submitted value aligned with what the user sees
function quantizeKg(kg: number) {
  return Math.round(kg * 10) / 10
}

export default function WeightScale({
  guessKg,
  setGuessKg,
  disabled,
  revealed,
  actualKg,
  crowdDots
}: {
  guessKg: number
  setGuessKg: (v: number) => void
  disabled: boolean
  revealed: boolean
  actualKg: number
  crowdDots: Dot[]
}) {
  // Slider domain
  const minKg = 0.5
  const maxKg = 1000

  // Histogram domain (always fixed as requested)
  const HIST_MIN = 1
  const HIST_MAX = 1000
  const BIN_COUNT = 100          // ✅ exactly 100 bins
  const BIN_KG = (HIST_MAX - HIST_MIN) / BIN_COUNT // 10kg per bin

  const guessLb = kgToLb(guessKg)

  // ✅ Slider is canonical in KG (prevents lb<->kg drift)
  const setFromKg = (kg: number) => {
    const next = quantizeKg(clamp(kg, minKg, maxKg))
    setGuessKg(next)
  }

  const pctSlider = (kg: number) => ((kg - minKg) / (maxKg - minKg)) * 100

  // Build 1kg bins across 1..1000 from crowdDots (other users)
  const { bins, maxCount, total } = React.useMemo(() => {
  const counts = new Array<number>(BIN_COUNT).fill(0)
  let t = 0

  for (const d of crowdDots) {
    const kg = Number(d.kg)
    if (!Number.isFinite(kg)) continue
    if (kg < HIST_MIN || kg > HIST_MAX) continue

    const idx = Math.floor((kg - HIST_MIN) / BIN_KG)
    if (idx >= 0 && idx < BIN_COUNT) {
      counts[idx] += 1
      t += 1
    }
  }

  const m = Math.max(1, ...counts)
  return { bins: counts, maxCount: m, total: t }
}, [crowdDots])


  // X position of user's submitted guess on histogram (0..100 viewBox)
  const guessX = React.useMemo(() => {
    const t = (guessKg - HIST_MIN) / (HIST_MAX - HIST_MIN)
    return clamp(t, 0, 1) * 100
  }, [guessKg])

  // (Optional) actual marker position on histogram (same axis)
  const actualX = React.useMemo(() => {
    const t = (actualKg - HIST_MIN) / (HIST_MAX - HIST_MIN)
    return clamp(t, 0, 1) * 100
  }, [actualKg])

  return (
    <motion.div layout className="glass rounded-3xl p-4 shadow-soft">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="text-sm tracking-wide" style={{ color: "var(--muted)" }}>
          Your guess
        </div>

        <div className="flex items-baseline justify-center gap-3">
          <div className="text-2xl leading-none">
            {round1(guessKg)} <span className="text-base">kg</span>
          </div>
          <div className="text-xl leading-none opacity-70">|</div>
          <div className="text-2xl leading-none">
            {round1(guessLb)} <span className="text-base">lb</span>
          </div>
        </div>
      </div>

      {/* KG scale (top) */}
      <div className="mt-3 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
        <span>{round1(minKg)} kg</span>
        <span>{round1(maxKg)} kg</span>
      </div>

      {/* Slider + overlays */}
      <div className="relative mt-1">
        <Slider value={guessKg} min={minKg} max={maxKg} step={0.1} onChange={setFromKg} disabled={disabled} />

        <div className="pointer-events-none absolute inset-0">
          {/* Crowd dots over slider (optional, stays as before) */}
          <AnimatePresence>
            {revealed && crowdDots.length > 0 && (
              <motion.div
                className="absolute left-0 right-0 top-1/2 h-6 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {crowdDots.slice(0, 250).map((d, i) => (
              <motion.div
                key={`${d.kg}-${i}`}
                className="absolute h-2 w-2 -translate-y-10 rounded-full"
                style={{
                  left: `${pctSlider(d.kg)}%`,
                  top: "25%",                 // ✅ higher (try 48–58%)
                  backgroundColor: "var(--ring)" // ✅ theme purple
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.10 }} // ✅ keep them very faint
                transition={{
                  delay: Math.min(10, i * 0.05),
                  duration: 1.2,
                  ease: "easeOut"
                }}
              />

            ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Correct weight indicator above slider */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: `${pctSlider(actualKg)}%`,
                  top: 0,
                  transform: "translateY(-120%)",
                  width: "8px",
                  height: "22px",
                  backgroundColor: "var(--ring)"
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* LB scale (bottom) */}
      <div className="mt-2 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
        <span>{round1(kgToLb(minKg))} lb</span>
        <span>{round1(kgToLb(maxKg))} lb</span>
      </div>

      {/* Histogram under LB scale */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            layout
            className="mt-4"
            initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, filter: "blur(10px)" }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="text-center text-xs tracking-wide" style={{ color: "var(--muted)" }}>
              Audience Submissions vs Actual Weight
            </div>

            <div className="mt-2 w-full px-[6px]">
  <div className="relative w-full">
    <svg
      viewBox="0 0 100 40"
      className="h-[110px] w-full"
      preserveAspectRatio="none"
    >
      {/* baseline */}
      <line
        x1="0"
        y1="38.5"
        x2="100"
        y2="38.5"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.6"
      />

      {/* bars */}
      {bins.map((c, i) => {
        if (c === 0) return null
        const barW = 100 / BIN_COUNT
        const x = i * barW
        const hPct = c / maxCount
        const barH = Math.max(0.8, Math.min(34, hPct * 34))
        const y = 38.5 - barH

        return (
          <motion.rect
            key={i}
            x={x}
            width={barW}
            y={y}
            height={barH}
            rx={0.4}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            transition={{ duration: 0.25 }}
            fill="var(--ring)"
          />
        )
      })}

      {/* actual weight line */}
      <motion.line
        x1={actualX}
        x2={actualX}
        y1="3"
        y2="38.5"
        stroke="var(--ring)"
        strokeWidth="0.9"
        strokeLinecap="round"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 0.35, pathLength: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
      />
    </svg>

    {/* ✅ user guess X as HTML overlay (not stretched) */}
    <motion.div
      className="pointer-events-none absolute top-[10px] -translate-x-1/2 select-none"
      style={{
        left: `${guessX}%`,
        color: "var(--ring)",
        fontWeight: 900,
        fontSize: 18,
        textShadow: "0 1px 0 rgba(0,0,0,0.25)"
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
    >
      ×
    </motion.div>
  </div>

  {/* Axis labels */}
  <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
    <span>1 kg</span>
    <span>250 kg</span>
    <span>500 kg</span>
    <span>750 kg</span>
    <span>1000 kg</span>
  </div>
</div>


          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
