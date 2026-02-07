"use client"

import * as React from "react"
import { motion } from "framer-motion"

/**
 * React Bits-style "Blur Text" component.
 * - lightweight: just Framer Motion
 * - tailwind-friendly
 */
export default function BlurText({
  text,
  className = "",
  delay = 0.04
}: {
  text: string
  className?: string
  delay?: number
}) {
  const chars = React.useMemo(() => Array.from(text), [text])
  return (
    <span className={"inline-flex flex-wrap " + className} aria-label={text}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(10px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: i * delay, duration: 0.45, ease: "easeOut" }}
          className="inline-block"
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </span>
  )
}
