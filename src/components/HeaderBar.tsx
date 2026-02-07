"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "@/lib/theme"
import { BarChart3, HelpCircle, Coffee, Sun, Moon } from "lucide-react"

export default function HeaderBar() {
  const { theme, toggle } = useTheme()

  // Prevent logo flicker during hydration
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = mounted ? theme === "dark" : true
  const logoSrc = isDark ? "/images/logo_dark.png" : "/images/logo.png"

  const iconSize = 20

  return (
    <header className="w-full pt-4 md:pt-6">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="glass flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 shadow-soft">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Go home">
            <img
              key={logoSrc}
              src={logoSrc}
              alt="Guess the Price"
              className="h-14 w-auto select-none"
              draggable={false}
            />
          </Link>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <Link
              href="/stats"
              aria-label="Overall stats"
              title="Overall stats"
              className="btnIcon flex h-10 w-10 items-center justify-center"
            >
              <BarChart3 size={iconSize} />
            </Link>

            <Link
              href="/how"
              aria-label="How to play"
              title="How to play"
              className="btnIcon flex h-10 w-10 items-center justify-center"
            >
              <HelpCircle size={iconSize} />
            </Link>

            <a
              href="https://buymeacoffee.com/wilpomillow"
              target="_blank"
              rel="noreferrer"
              aria-label="Buy Me a Coffee"
              title="Buy Me a Coffee"
              className="btnIcon hidden h-10 w-10 items-center justify-center sm:flex"
            >
              <Coffee size={iconSize} />
            </a>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="btnIcon flex h-10 w-10 items-center justify-center"
            >
              {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
