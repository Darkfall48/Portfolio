import { useEffect } from 'react'

export function usePointerSpot() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    function onMove(event: PointerEvent) {
      document.documentElement.style.setProperty('--spot-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--spot-y', `${event.clientY}px`)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
