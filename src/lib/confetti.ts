import confetti from "canvas-confetti"

/**
 * Centralised brand colour
 * Keep this in sync with --btn-primary-bg (#ff6a00)
 */
const ORANGE = "#ff6a00"

export async function fireSideConfetti() {
  const defaults = {
    particleCount: 40,
    spread: 70,
    startVelocity: 35,
    gravity: 0.9,
    ticks: 220,
    scalar: 1,
    colors: [ORANGE],
  }

  // Left burst
  confetti({
    ...defaults,
    origin: { x: 0.1, y: 0.6 },
    angle: 60,
  })

  // Right burst
  confetti({
    ...defaults,
    origin: { x: 0.9, y: 0.6 },
    angle: 120,
  })
}
