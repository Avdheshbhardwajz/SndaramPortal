import { useState, useEffect, useCallback } from "react"

export const useOTPTimer = (initialDuration: number = 90) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration)
  const [isActive, setIsActive] = useState(false)

  const startTimer = useCallback((duration?: number) => {
    setTimeLeft(duration || initialDuration)
    setIsActive(true)
  }, [initialDuration])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(0)
  }, [])

  useEffect(() => {
    let intervalId: number | undefined

    if (isActive && timeLeft > 0) {
      intervalId = window.setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [isActive, timeLeft])

  return { timeLeft, startTimer, stopTimer, isActive }
}
