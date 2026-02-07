"use client"

import * as React from "react"
import GameCard from "@/components/GameCard"

type Item = {
  itemID: string
  title: string
  imageUrl: string
  actualPrice: number
  referenceLink: string
}

export default function ItemsClient({ items }: { items: Item[] }) {
  // GameCard now manages its own session order + next/restart,
  // so ItemsClient no longer needs to track idx.
  return (
    <div className="w-full">
      <GameCard items={items} />
    </div>
  )
}
