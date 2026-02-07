"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/45" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-xl glass rounded-3xl p-5 shadow-soft"
            initial={{ y: 20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xl tracking-wide">{title}</div>
              <button className="btnIcon" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="mt-4 text-[15px] leading-relaxed">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
