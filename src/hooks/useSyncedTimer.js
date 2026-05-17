import { useEffect, useState } from 'react';

/**
 * Synchronized countdown based on server-provided endsAt timestamp.
 * Uses server clock offset to stay in sync across clients.
 */
export function useSyncedTimer(endsAt, serverNow) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAt || !serverNow) {
      setRemaining(0);
      return;
    }

    const clockOffset = serverNow - Date.now();

    const tick = () => {
      const now = Date.now() + clockOffset;
      const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
      setRemaining(left);
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [endsAt, serverNow]);

  return remaining;
}
