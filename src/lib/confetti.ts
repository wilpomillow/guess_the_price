const PURPLE = "#7c3aed" // violet-600

type ConfettiFn = (opts: any) => void

async function getConfetti(): Promise<ConfettiFn> {
  // Works whether the package exports default or module.exports
  const mod: any = await import("canvas-confetti")
  return (mod?.default ?? mod) as ConfettiFn
}

export async function fireSideConfetti() {
  const confetti = await getConfetti()

  const durationMs = 1200
  const end = Date.now() + durationMs

  const shoot = (originX: number) => {
    confetti({
      particleCount: 6,
      angle: originX < 0.5 ? 60 : 120,
      spread: 70,
      startVelocity: 42,
      ticks: 200,
      origin: { x: originX, y: 0.6 },
      colors: [PURPLE],
      scalar: 1.1
    })
  }

  const timer = setInterval(() => {
    shoot(0.02) // left
    shoot(0.98) // right
    if (Date.now() > end) clearInterval(timer)
  }, 140)
}
