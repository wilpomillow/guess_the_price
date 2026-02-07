"use client"

import * as React from "react"

type StatsPayload = {
  overall: { count: number; avgGuessUsd: number }
  perItem: { _id: string; count: number; avgGuessUsd: number }[]
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </div>
      <div className="mt-1 text-2xl leading-none">{value}</div>
    </div>
  )
}

function usd(n: number) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

export default function StatsClient() {
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<StatsPayload | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    setLoading(true)
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return
        setStats(d)
        setErr(null)
      })
      .catch((e) => {
        if (!alive) return
        setErr(e?.message || "Could not load stats")
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <div>Loading…</div>
  if (err) return <div style={{ color: "var(--muted)" }}>{err}</div>

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Total submissions" value={stats?.overall?.count ?? 0} />
        <StatCard label="Avg guess (USD)" value={usd(Number(stats?.overall?.avgGuessUsd ?? 0))} />
      </div>

      <div className="mt-4">
        <div className="text-lg tracking-wide">Top items</div>
        <div className="mt-2 h-[52vh] overflow-auto rounded-2xl border border-white/15 bg-white/5 p-2">
          <div className="grid gap-2">
            {(stats?.perItem || []).map((x) => (
              <div
                key={x._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="min-w-0 truncate pr-3">
                  <div className="text-sm">{x._id}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                    avg: {usd(Number(x.avgGuessUsd))}
                  </div>
                </div>
                <div className="text-sm">{x.count}</div>
              </div>
            ))}
            {(!stats?.perItem || stats.perItem.length === 0) && (
              <div style={{ color: "var(--muted)" }}>No submissions yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
