"use client"

import * as React from "react"
import HeaderBar from "@/components/HeaderBar"
import Footer from "@/components/Footer"
import GameCard from "@/components/GameCard"
import NeonGrid from "@/components/reactbits/NeonGrid"

type Item = {
  itemID: string
  title: string
  imageUrl: string
  actualPrice: number
  referenceLink: string
}

export default function HeaderShell({ items }: { items: Item[] }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <HeaderBar />

      {/* main (scrolls with the page) */}
      <main className="flex-1">
        <GameCard items={items} />
      </main>

      {/* footer at the very bottom */}
      <footer className="mt-auto px-4 pb-6 pt-4 text-center text-xs" style={{ color: "var(--muted)" }}>
        Copyright © {new Date().getFullYear()} Wilpo Millow. All rights reserved.
      </footer>
    </div>
  )
}
