import * as React from "react"

type Props = React.SVGProps<SVGSVGElement> & { title?: string }

export function IconMoon(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 13a8 8 0 1 1-10-10 7 7 0 0 0 10 10Z" />
    </svg>
  )
}
export function IconSun(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
export function IconChart(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 14v4M11 10v8M15 6v12M19 12v6" />
    </svg>
  )
}
export function IconInfo(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-5" />
      <path d="M12 8h.01" />
    </svg>
  )
}
export function IconNext(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}
export function IconCoffee(props: Props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v8a5 5 0 0 1-10 0V4Z" />
      <path d="M17 6h2a3 3 0 0 1 0 6h-2" />
    </svg>
  )
}
