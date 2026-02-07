export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo"

type Body = {
  itemID: string
  guessUsd: number
}

const MIN_USD = 1
const MAX_USD = 50000
const BUCKET_USD = 5000
const KEEP_N = 100

type Bucket = { startUsd: number; endUsd: number; count: number }

type StatSummary = {
  n: number
  meanUsd: number
  sdUsd: number
  zScore: number | null
  zAbs: number | null
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function buildHistogram(guesses: number[]): Bucket[] {
  const buckets: Bucket[] = []
  for (let start = 0; start < MAX_USD; start += BUCKET_USD) {
    buckets.push({ startUsd: start, endUsd: start + BUCKET_USD, count: 0 })
  }

  for (const g0 of guesses) {
    const g = clamp(g0, MIN_USD, MAX_USD)
    const idx = Math.min(buckets.length - 1, Math.max(0, Math.floor(g / BUCKET_USD)))
    buckets[idx].count += 1
  }

  return buckets
}

function stats(guesses: number[], userGuessUsd: number): StatSummary {
  const xs = guesses.filter((x) => Number.isFinite(x))
  const n = xs.length
  if (n === 0) return { n: 0, meanUsd: 0, sdUsd: 0, zScore: null, zAbs: null }

  const meanUsd = xs.reduce((a, b) => a + b, 0) / n
  const varPop = xs.reduce((acc, x) => acc + (x - meanUsd) * (x - meanUsd), 0) / n
  const sdUsd = Math.sqrt(varPop)

  if (sdUsd <= 0) {
    return { n, meanUsd: round2(meanUsd), sdUsd: 0, zScore: null, zAbs: null }
  }

  const zScore = (userGuessUsd - meanUsd) / sdUsd
  return {
    n,
    meanUsd: round2(meanUsd),
    sdUsd: round2(sdUsd),
    zScore: round2(zScore),
    zAbs: round2(Math.abs(zScore))
  }
}

/**
 * Trims collection for an itemID to newest KEEP_N documents.
 * Efficient FIFO: find cutoff doc (KEEP_N-th newest) then delete older than it.
 */
async function trimToLastN(col: any, itemID: string, n: number) {
  const cutoff = await col
    .find({ itemID }, { projection: { createdAt: 1 } })
    .sort({ createdAt: -1 })
    .skip(n)
    .limit(1)
    .toArray()

  if (!cutoff?.length) return

  const cutoffDate = cutoff[0].createdAt as Date
  await col.deleteMany({ itemID, createdAt: { $lt: cutoffDate } })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Body>
    const itemID = String(body.itemID || "").trim()
    const guessUsdRaw = Number(body.guessUsd)

    if (!itemID || !Number.isFinite(guessUsdRaw)) {
      return NextResponse.json({ ok: false, error: "Invalid submission." }, { status: 400 })
    }

    const guessUsd = round2(clamp(guessUsdRaw, MIN_USD, MAX_USD))

    const db = await getDb()
    const collectionName = process.env.MONGODB_COLLECTION || "submissions"
    const col = db.collection(collectionName)

    // ✅ DO NOT create indexes per request (slow + can lock).
    // Create these once manually in MongoDB/Atlas:
    // db.submissions.createIndex({ itemID: 1, createdAt: -1 })

    // Insert the new guess
    await col.insertOne({
      itemID,
      guessUsd,
      createdAt: new Date()
    })

    // FIFO cap: keep newest 100 guesses for this itemID
    await trimToLastN(col, itemID, KEEP_N)

    // Read back newest 100
    const recent = await col
      .find({ itemID }, { projection: { _id: 0, guessUsd: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(KEEP_N)
      .toArray()

    const guesses = recent.map((r: any) => Number(r.guessUsd)).filter(Number.isFinite)
    const histogram = buildHistogram(guesses)
    const summary = stats(guesses, guessUsd)

    return NextResponse.json({
      ok: true,
      recent,
      histogram: { bucketUsd: BUCKET_USD, buckets: histogram },
      stats: summary
    })
  } catch (err: any) {
    console.error("SUBMIT ERROR:", err)
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown server error"
      },
      { status: 500 }
    )
  }
}
