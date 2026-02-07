"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import BlurText from "@/components/reactbits/BlurText"
import PriceScale from "@/components/PriceScale"
import { IconNext } from "@/components/icons"
import { fireSideConfetti } from "@/lib/confetti"

type Item = {
  itemID: string
  title: string
  imageUrl: string
  actualPrice: number
  referenceLink: string
}

type Recent = { guessUsd: number; createdAt: string }

type SubmitStats = {
  n: number
  meanUsd: number
  sdUsd: number
  zScore: number | null
  zAbs: number | null
}

type SubmitResponse = {
  ok: boolean
  recent: Recent[]
  stats?: SubmitStats
  error?: string
}

const ORDER_KEY = "gtp-session-order-v1"
const INDEX_KEY = "gtp-session-index-v1"
const DECK_HASH_KEY = "gtp-session-deckhash-v1"

function stableDeckHash(items: Item[]) {
  return items
    .map((x) => x.itemID)
    .slice()
    .sort()
    .join("|")
}

function shuffleDifferent(items: Item[]): Item[] {
  if (items.length <= 1) return [...items]
  const original = items.map((x) => x.itemID).join("|")
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  if (a.map((x) => x.itemID).join("|") === original) return [...a.slice(1), a[0]]
  return a
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function seedGuessUsd(actualUsd: number) {
  const seed = actualUsd ? actualUsd * 0.75 : 250
  return Math.min(50000, Math.max(1, Math.round(seed)))
}

function closenessRatio(guessUsd: number, actualUsd: number) {
  const g = Number(guessUsd)
  const a = Number(actualUsd)
  if (!Number.isFinite(g) || !Number.isFinite(a) || g <= 0 || a <= 0) return null
  return Math.min(g, a) / Math.max(g, a)
}

export default function GameCard({ items }: { items: Item[] }) {
  const [order, setOrder] = React.useState<Item[] | null>(null)
  const [idx, setIdx] = React.useState(0)

  const [guessUsd, setGuessUsd] = React.useState(5)
  const guessUsdRef = React.useRef(guessUsd)
  React.useEffect(() => {
    guessUsdRef.current = guessUsd
  }, [guessUsd])

  const [revealed, setRevealed] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const [recent, setRecent] = React.useState<Recent[]>([])
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const confettiFiredRef = React.useRef(false)

  // Restore session order
  React.useEffect(() => {
    if (!items?.length) return

    const byId = new Map(items.map((x) => [x.itemID, x]))
    const deckHash = stableDeckHash(items)

    const storedHash = sessionStorage.getItem(DECK_HASH_KEY)
    const storedOrder = sessionStorage.getItem(ORDER_KEY)
    const storedIdx = sessionStorage.getItem(INDEX_KEY)

    let nextOrder: Item[] = []

    if (storedHash === deckHash && storedOrder) {
      try {
        const ids = JSON.parse(storedOrder) as unknown
        if (Array.isArray(ids) && ids.every((x) => typeof x === "string")) {
          nextOrder = (ids as string[]).map((id) => byId.get(id)).filter(Boolean) as Item[]
        }
      } catch {
        nextOrder = []
      }
    }

    if (nextOrder.length !== items.length) {
      nextOrder = shuffleDifferent(items)
      sessionStorage.setItem(DECK_HASH_KEY, deckHash)
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(nextOrder.map((x) => x.itemID)))
      sessionStorage.setItem(INDEX_KEY, "0")
      setOrder(nextOrder)
      setIdx(0)
      return
    }

    const restored = clampInt(Number(storedIdx || 0) || 0, 0, nextOrder.length - 1)
    setOrder(nextOrder)
    setIdx(restored)
  }, [items])

  const item = order?.[idx] ?? null
  const isLast = !!order && idx >= order.length - 1

  // Reset per item
  React.useEffect(() => {
    if (!item) return
    setGuessUsd(seedGuessUsd(item.actualPrice))
    setRevealed(false)
    setSubmitting(false)
    setRecent([])
    setSubmitError(null)
    confettiFiredRef.current = false
  }, [item?.itemID])

  // Confetti once per item on strong match
  React.useEffect(() => {
    if (!revealed || !item) return
    if (confettiFiredRef.current) return
    const score = closenessRatio(guessUsdRef.current, item.actualPrice)
    if (score !== null && score >= 0.9) {
      confettiFiredRef.current = true
      void fireSideConfetti()
    }
  }, [revealed, item?.itemID])

  const crowdDots = React.useMemo(() => {
    return recent
      .map((r) => ({ usd: Number(r.guessUsd) }))
      .filter((x) => Number.isFinite(x.usd))
  }, [recent])

  async function submit() {
    if (!item || submitting || revealed) return
    setSubmitting(true)
    setSubmitError(null)

    const guessToSubmitUsd = guessUsdRef.current

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemID: item.itemID, guessUsd: guessToSubmitUsd })
      })

      const data = (await res.json()) as SubmitResponse
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Submission failed")

      setRecent(Array.isArray(data.recent) ? data.recent : [])
      setRevealed(true)
    } catch (e: any) {
      setSubmitError(e?.message || "Could not submit")
      setRecent([])
      setRevealed(true)
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    if (!order || isLast) return
    setRevealed(false)
    setSubmitting(false)
    setRecent([])
    setSubmitError(null)
    confettiFiredRef.current = false

    const n = idx + 1
    setIdx(n)
    sessionStorage.setItem(INDEX_KEY, String(n))
  }

  function restartSession() {
    if (!items?.length) return
    const fresh = shuffleDifferent(items)

    sessionStorage.setItem(DECK_HASH_KEY, stableDeckHash(items))
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(fresh.map((x) => x.itemID)))
    sessionStorage.setItem(INDEX_KEY, "0")

    setOrder(fresh)
    setIdx(0)

    setRevealed(false)
    setSubmitting(false)
    setRecent([])
    setSubmitError(null)
    confettiFiredRef.current = false
  }

  if (!order || !item) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4 pt-4">
        <div className="glass rounded-[28px] p-6 shadow-soft">
          <div className="text-xl">Loading…</div>
        </div>
      </section>
    )
  }

  return (
    // ✅ no h-full here — allow the card to grow when the reveal panel appears
    <section className="mx-auto w-full max-w-5xl px-4 py-4">
      {/* ✅ no h-full here either */}
      <motion.div layout className="glass w-full rounded-[28px] p-4 shadow-soft md:p-6">
        {/* Title + counter */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <BlurText
  text={item.title}
  className="font-bangers text-3xl leading-none md:text-4xl"
/>

            <div
              className="mt-1 text-sm tracking-wide text-center md:text-left"
              style={{ color: "var(--muted)" }}
            >
              Item <span style={{ color: "var(--counter)" }}>{idx + 1}</span> / {order.length}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <motion.div layout className="mt-3 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
          {/* Image panel */}
          <motion.div layout className="glass rounded-3xl p-3 md:p-4">
            <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              <div className="relative mx-auto w-full max-w-[440px]">
                <div className="relative aspect-square">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={item.itemID}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, scale: 0.985, filter: "blur(6px)" }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 92vw, 520px"
                        className="object-contain p-4"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right panel */}
          <motion.div layout className="flex flex-col gap-4">
            <PriceScale
              key={item.itemID}
              guessUsd={guessUsd}
              setGuessUsd={setGuessUsd}
              disabled={submitting || revealed}
              revealed={revealed}
              actualUsd={item.actualPrice}
              crowdDots={crowdDots}
            />

            {/* ✅ revealed panel is in normal flow — will increase card height */}
            <AnimatePresence initial={false}>
              {revealed && (
                <motion.div
                  key={`actual-wrap-${item.itemID}`}
                  layout
                  initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <ActualPricePanel
                    actualUsd={item.actualPrice}
                    referenceLink={item.referenceLink}
                    guessUsd={guessUsdRef.current}
                    submitError={submitError}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealed && isLast && (
                <motion.div
                  layout
                  className="glass rounded-2xl p-3 text-center shadow-soft"
                  initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(8px)" }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-lg">Session complete 🎉</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    No repeats until you restart.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Bottom action */}
        <motion.div layout className="mt-3">
          {!revealed ? (
            <button className="btnPrimary w-full" onClick={submit} disabled={submitting}>
              {submitting ? "SUBMITTING…" : "SUBMIT"}
            </button>
          ) : isLast ? (
            <button className="btnGhost w-full" onClick={restartSession}>
              RESTART (RESHUFFLE)
            </button>
          ) : (
            <button className="btnGhost w-full" onClick={next}>
              <span className="inline-flex items-center justify-center gap-2">
                NEXT <IconNext />
              </span>
            </button>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}

function ActualPricePanel({
  actualUsd,
  referenceLink,
  guessUsd,
  submitError
}: {
  actualUsd: number
  referenceLink: string
  guessUsd: number
  submitError: string | null
}) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n)

  const closeness = (() => {
    const g = Number(guessUsd)
    const a = Number(actualUsd)
    if (!Number.isFinite(g) || !Number.isFinite(a) || g <= 0 || a <= 0) return null
    return Math.min(g, a) / Math.max(g, a)
  })()

  return (
    <motion.div
      layout
      className="glass w-full max-w-full overflow-hidden rounded-3xl p-4 shadow-soft"
    >
      <div className="flex min-w-0 flex-col items-center text-center">
        <div className="text-sm tracking-wide" style={{ color: "var(--muted)" }}>
          Actual Price
        </div>

        <div
  className="mt-2 w-full min-w-0 truncate font-bangers leading-none"
  style={{
    fontSize: "clamp(32px, 6vw, 56px)",
    color: "var(--fg)"
  }}
>
  {fmt(actualUsd)}
</div>


        {closeness !== null && (
          <div className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Closeness: <b>{Math.round(closeness * 100)}%</b>
          </div>
        )}

        {submitError && (
          <div className="mt-2 w-full min-w-0 break-words text-xs" style={{ color: "var(--muted)" }}>
            Couldn’t log your guess right now: {submitError}
          </div>
        )}

        <a
          className="mt-3 inline-flex max-w-full items-center justify-center break-words text-sm underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
          href={referenceLink}
          target="_blank"
          rel="noreferrer"
        >
          Reference
        </a>
      </div>
    </motion.div>
  )
}
