import { useEffect, useState, useCallback } from "react";

const KEY = "nexkart:wishlist";
const EVT = "nexkart:wishlist:change";

function readStorage() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function writeStorage(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new Event(EVT));
  } catch {
    // storage unavailable — silently ignore
  }
}

// Single source of truth synced across cards via custom event
export function useWishlist() {
  const [ids, setIds] = useState(() => readStorage());

  useEffect(() => {
    const sync = () => setIds(readStorage());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isWishlisted = useCallback((id) => ids.has(id), [ids]);

  const toggle = useCallback((id) => {
    const next = new Set(ids);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    writeStorage(next);
    setIds(next);
    return !ids.has(id); // returns whether item is now wishlisted
  }, [ids]);

  return { ids, isWishlisted, toggle, count: ids.size };
}
