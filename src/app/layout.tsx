import type { Metadata } from "next"
import { Bangers, Sour_Gummy } from "next/font/google"
import "./globals.css"

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap"
})

const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: "400", // ✅ regular
  variable: "--font-sour-gummy",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Guess the Price",
  description: "Guess the price, see the crowd, and learn the truth.",
  icons: {
    icon: "/favicon.png"
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bangers.variable} ${sourGummy.variable}`}>
      <body className="min-h-screen font-[var(--font-bangers)]">{children}</body>
    </html>
  )
}

