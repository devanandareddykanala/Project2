import { useCallback, useEffect, useRef, useState } from "react";

interface UseSessionTimeoutOptions {
  timeoutMinutes: number;
  warningSeconds: number;
  onTimeout: () => void;
}

interface UseSessionTimeoutReturn {
  showWarning: boolean;
  timeRemaining: number;
  resetTimer: () => void;
}

export function useSessionTimeout({
  timeoutMinutes,
  warningSeconds,
  onTimeout,
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = timeoutMs - warningSeconds * 1000;

    if (warningMs > 0) {
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
        setTimeRemaining(warningSeconds);

        countdownRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, warningMs);
    }

    timeoutRef.current = setTimeout(() => {
      clearTimers();
      onTimeout();
    }, timeoutMs);
  }, [clearTimers, onTimeout, timeoutMinutes, warningSeconds]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      resetTimer();
    };

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    resetTimer();

    return () => {
      clearTimers();
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [clearTimers, resetTimer]);

  return { showWarning, timeRemaining, resetTimer };
}
