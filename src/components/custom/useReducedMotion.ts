import { useEffect, useState } from 'react'

/** 동작 줄이기 선호 감지. motion/react 의 useReducedMotion 대응 (의존성 없이 matchMedia) */
export function useReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduce(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduce
}
