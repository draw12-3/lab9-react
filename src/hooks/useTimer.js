import { useEffect, useMemo, useState } from "react";

export function useTimer({ duration, onExpire, resetKey, enabled = true }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, resetKey]);

  useEffect(() => {
    if (!enabled) return;
    if (duration === null) return;
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, duration, onExpire, enabled]);

  const percentage = useMemo(() => {
    if (duration === null || duration === 0) return 100;
    return Math.max(0, (timeLeft / duration) * 100);
  }, [timeLeft, duration]);

  return {
    timeLeft,
    percentage,
  };
}