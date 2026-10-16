import { useEffect, useState } from "react";

/** Seconds left from `seconds`, restartable (the resend-code timer) */
export function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  return { left, restart: () => setEndsAt(Date.now() + seconds * 1000) };
}

export const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
