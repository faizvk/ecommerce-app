import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ProductRow from "./ProductRow";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useWishlist } from "../hooks/useWishlist";
import { fetchAIPicks } from "../api/ai.api";

/**
 * AI Picks for You — six products chosen by Groq based on the user's
 * recent signals (recently viewed + wishlist + cart). Only renders when:
 *   1. user is authenticated (the endpoint requires auth)
 *   2. we have at least one signal to send (otherwise the row is generic
 *      and not really 'for you')
 *   3. the AI call succeeds and returns ≥3 products
 *
 * Failures are silent — picks are a nice-to-have, not a critical path.
 */
export default function AIPicksRow() {
  const user = useSelector((s) => s.auth.user);
  const cartItems = useSelector((s) => s.cartItems?.items) || [];
  const { items: recentlyViewed } = useRecentlyViewed();
  const { items: wishlistIds } = useWishlist();

  const [picks, setPicks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Build the signal list: recently viewed (full info) + wishlist (IDs only,
    // names unavailable in localStorage) + cart line names. Cap to 12 server-side.
    const signals = [
      ...recentlyViewed.map((p) => ({
        name: p.name,
        category: p.category,
        salePrice: p.salePrice,
      })),
      ...cartItems
        .filter((ci) => ci?.productId?.name)
        .map((ci) => ({
          name: ci.productId.name,
          category: ci.productId.category,
          salePrice: ci.productId.salePrice,
        })),
    ];

    // Skip the call if there's nothing personal — the row would just look like
    // a random sample and add latency for no value.
    if (signals.length === 0 && wishlistIds.length === 0) return;

    let cancelled = false;
    fetchAIPicks(signals)
      .then((res) => {
        if (cancelled) return;
        const products = res.data?.data?.products || [];
        if (products.length >= 3) setPicks(products);
        setLoaded(true);
      })
      .catch(() => {
        // Silent failure — picks are nice-to-have, not critical
        if (!cancelled) setLoaded(true);
      });

    return () => { cancelled = true; };
    // Only refetch when the user changes — picks for a given session are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user || !loaded || picks.length < 3) return null;

  return (
    <section className="max-w-[1320px] mx-auto px-2 md:px-4">
      <ProductRow
        title="✨ Picks for You"
        subtitle="Personalised by AI based on what you've browsed"
        accent="from-fuchsia-400 via-violet-500 to-indigo-600"
        products={picks}
        viewAllHref="/search"
      />
    </section>
  );
}
