import { useState, useEffect, useCallback } from 'react';

interface UseOTPTimerReturn {
  timer: number;
  isActive: boolean;
  canResend: boolean;
  startTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export const useOTPTimer = (initialSeconds: number = 90): UseOTPTimerReturn => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsActive(false);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timer]);

  const startTimer = useCallback(() => {
    setTimer(initialSeconds);
    setIsActive(true);
    setCanResend(false);
  }, [initialSeconds]);

  const resetTimer = useCallback(() => {
    setTimer(0);
    setIsActive(false);
    setCanResend(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timer,
    isActive,
    canResend,
    startTimer,
    resetTimer,
    formatTime,
  };
};
