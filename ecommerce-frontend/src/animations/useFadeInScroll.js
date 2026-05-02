import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Reveals elements with `data-fade="true"` once they scroll into view.
 *
 * IMPORTANT: animation runs once. After an element is revealed, it stays
 * revealed even when scrolled out of view. Previously the observer was
 * also re-hiding elements as they exited the viewport, which made cart
 * rows / cards disappear when scrolled past on mobile.
 */
export function useFadeInScroll() {
  const location = useLocation();

  useEffect(() => {
    // Reset binding flag on route change so newly mounted elements get observed
    document.querySelectorAll("[data-fade='true']").forEach((el) => {
      el.removeAttribute("data-fade-bound");
    });

    let observer = null;

    const observe = () => {
      const elements = document.querySelectorAll(
        "[data-fade='true']:not([data-fade-bound])"
      );
      if (!elements.length) return;

      if (!observer) {
        observer = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              const el = entry.target;
              el.style.opacity = "1";
              el.style.transform = "translate(0, 0)";
              // Once revealed, stop watching — element stays visible
              obs.unobserve(el);
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
      }

      elements.forEach((el) => {
        el.setAttribute("data-fade-bound", "true");
        observer.observe(el);
      });
    };

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [location.pathname]);
}
