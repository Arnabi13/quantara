import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    let raf: number

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}
