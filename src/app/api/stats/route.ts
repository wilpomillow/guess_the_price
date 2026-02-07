import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongo"

export async function GET() {
  const db = await getDb()
  const col = db.collection("submissions")

  const overall = await col
    .aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgGuessUsd: { $avg: "$guessUsd" }
        }
      }
    ])
    .toArray()

  const perItem = await col
    .aggregate([
      { $group: { _id: "$itemID", count: { $sum: 1 }, avgGuessUsd: { $avg: "$guessUsd" } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ])
    .toArray()

  return NextResponse.json({
    overall: overall[0] || { count: 0, avgGuessUsd: 0 },
    perItem
  })
}
