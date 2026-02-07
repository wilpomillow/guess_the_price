"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Slider from "@/components/ui/Slider"

type Dot = { usd: number }

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function round0(n: number) {
  return Math.round(n)
}

function usd(n: number) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `$${round0(n)}`
  }
}

export default function PriceScale({
  guessUsd,
  setGuessUsd,
  disabled,
  revealed,
  actualUsd,
  crowdDots
}: {
  guessUsd: number
  setGuessUsd: (v: number) => void
  disabled: boolean
  revealed: boolean
  actualUsd: number
  crowdDots: Dot[]
}) {
  // Slider domain
  const minUsd = 1
  const maxUsd = 50000


// Allow typed input for integer guesses
const [typed, setTyped] = React.useState<string>(String(guessUsd))
const isEditingRef = React.useRef(false)

React.useEffect(() => {
  if (!isEditingRef.current) setTyped(String(guessUsd))
}, [guessUsd])

const commitTyped = () => {
  const raw = typed.trim()
  const digits = raw.replace(/[^\d]/g, "")
  if (!digits) {
    setTyped(String(guessUsd))
    return
  }
  const n = parseInt(digits, 10)
  if (!Number.isFinite(n)) {
    setTyped(String(guessUsd))
    return
  }
  const next = round0(clamp(n, minUsd, maxUsd))
  setGuessUsd(next)
  setTyped(String(next))
}

  // Histogram domain (fixed)
  const HIST_MIN = 1
  const HIST_MAX = 50000
  const BIN_COUNT = 100
  const BIN_USD = (HIST_MAX - HIST_MIN) / BIN_COUNT

  const setFromUsd = (v: number) => {
    const next = round0(clamp(v, minUsd, maxUsd))
    setGuessUsd(next)
  }

  const pctSlider = (v: number) => ((v - minUsd) / (maxUsd - minUsd)) * 100

  const { bins, maxCount } = React.useMemo(() => {
    const counts = new Array<number>(BIN_COUNT).fill(0)

    for (const d of crowdDots) {
      const v = Number(d.usd)
      if (!Number.isFinite(v)) continue
      if (v < HIST_MIN || v > HIST_MAX) continue

      const idx = Math.floor((v - HIST_MIN) / BIN_USD)
      if (idx >= 0 && idx < BIN_COUNT) counts[idx] += 1
    }

    const m = Math.max(1, ...counts)
    return { bins: counts, maxCount: m }
  }, [crowdDots])

  const guessX = React.useMemo(() => {
    const t = (guessUsd - HIST_MIN) / (HIST_MAX - HIST_MIN)
    return clamp(t, 0, 1) * 100
  }, [guessUsd])

  const actualX = React.useMemo(() => {
    const t = (actualUsd - HIST_MIN) / (HIST_MAX - HIST_MIN)
    return clamp(t, 0, 1) * 100
  }, [actualUsd])

  return (
    <motion.div layout className="glass rounded-3xl p-4 shadow-soft">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="text-sm tracking-wide" style={{ color: "var(--muted)" }}>
          Your guess
        </div>

<div className="text-3xl leading-none flex items-center justify-center gap-2">
  <span aria-hidden="true">$</span>
  <input
    value={typed}
    inputMode="numeric"
    pattern="\d*"
    onFocus={() => {
      isEditingRef.current = true
    }}
    onBlur={() => {
      isEditingRef.current = false
      commitTyped()
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        ;(e.target as HTMLInputElement).blur()
      }
    }}
    onChange={(e) => {
      // keep it permissive while typing; validate on blur/enter
      const v = e.target.value
      setTyped(v)
    }}
    className="w-[7ch] bg-transparent text-center outline-none rounded-lg border border-white/10 px-2 py-1"
    aria-label="Type your guess in USD"
  />
</div>
      </div>

      {/* USD scale (top) */}
      <div className="mt-3 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
        <span>{usd(minUsd)}</span>
        <span>{usd(maxUsd)}</span>
      </div>

      {/* Slider + overlays */}
      <div className="relative mt-1">
        <Slider value={guessUsd} min={minUsd} max={maxUsd} step={1} onChange={setFromUsd} disabled={disabled} />

        <div className="pointer-events-none absolute inset-0">
          {/* Crowd dots over slider */}
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
                    key={`${d.usd}-${i}`}
                    className="absolute h-2 w-2 -translate-y-10 rounded-full"
                    style={{
                      left: `${pctSlider(d.usd)}%`,
                      top: "25%",
                      backgroundColor: "var(--ring)"
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.10 }}
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

          {/* Actual price indicator above slider */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  left: `${pctSlider(actualUsd)}%`,
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

      {/* Histogram */}
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
              Audience Submissions vs Actual Price
            </div>

            <div className="mt-2 w-full px-[6px]">
              <div className="relative w-full">
                <svg viewBox="0 0 100 40" className="h-[110px] w-full" preserveAspectRatio="none">
                  <line
                    x1="0"
                    y1="38.5"
                    x2="100"
                    y2="38.5"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.6"
                  />

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

              <div className="mt-1 flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                <span>{usd(1)}</span>
                <span>{usd(500)}</span>
                <span>{usd(1000)}</span>
                <span>{usd(25000)}</span>
                <span>{usd(50000)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
