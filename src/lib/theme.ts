"use client"

import * as React from "react"

const KEY = "gtp-theme"

export type Theme = "dark" | "light"

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>("dark")

  React.useEffect(() => {
    const stored = sessionStorage.getItem(KEY)
    const next: Theme = stored === "light" ? "light" : "dark"
    setTheme(next)
    document.documentElement.classList.toggle("dark", next === "dark")
  }, [])

  const toggle = React.useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark"
      sessionStorage.setItem(KEY, next)
      document.documentElement.classList.toggle("dark", next === "dark")
      return next
    })
  }, [])

  return { theme, toggle }
}
