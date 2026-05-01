import { useEffect, useState, useCallback } from "react";

const KEY = "nexkart:wishlist";
const EVT = "nexkart:wishlist:change";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrate from legacy ID-only format to product snapshots
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
      return parsed.map((id) => ({ _id: id }));
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVT));
  } catch {
    // storage unavailable
  }
}

function snapshot(p) {
  if (!p?._id) return null;
  return {
    _id: p._id,
    name: p.name,
    image: p.image,
    salePrice: p.salePrice,
    costPrice: p.costPrice,
    category: p.category,
    stock: p.stock,
    addedAt: Date.now(),
  };
}

export function useWishlist() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isWishlisted = useCallback(
    (id) => items.some((p) => p._id === id),
    [items]
  );

  // Accepts either a product object or just an id (for removal)
  const toggle = useCallback((productOrId) => {
    const id = typeof productOrId === "string" ? productOrId : productOrId?._id;
    if (!id) return false;
    const exists = items.some((p) => p._id === id);
    let next;
    if (exists) {
      next = items.filter((p) => p._id !== id);
    } else {
      const snap = typeof productOrId === "string" ? { _id: id } : snapshot(productOrId);
      next = [snap, ...items];
    }
    write(next);
    setItems(next);
    return !exists;
  }, [items]);

  const remove = useCallback((id) => {
    const next = items.filter((p) => p._id !== id);
    write(next);
    setItems(next);
  }, [items]);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  return { items, isWishlisted, toggle, remove, clear, count: items.length };
}
