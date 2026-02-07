export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-4 pt-3 text-center text-xs" style={{ color: "var(--muted)" }}>
      Copyright © {year} Wilpo Millow. All rights reserved.
    </footer>
  )
}
