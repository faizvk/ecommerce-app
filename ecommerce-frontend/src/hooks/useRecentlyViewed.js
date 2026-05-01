import { useEffect, useState, useCallback } from "react";

const KEY = "nexkart:recentlyViewed";
const MAX = 8;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(read);

  const track = useCallback((product) => {
    if (!product?._id) return;
    const stripped = {
      _id: product._id,
      name: product.name,
      image: product.image,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      category: product.category,
      stock: product.stock,
    };
    const next = [stripped, ...read().filter((p) => p._id !== product._id)].slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setItems(next);
  }, []);

  const others = useCallback((excludeId) => items.filter((p) => p._id !== excludeId), [items]);

  useEffect(() => { setItems(read()); }, []);

  return { items, track, others };
}
