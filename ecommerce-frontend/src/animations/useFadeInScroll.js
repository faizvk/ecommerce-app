import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useFadeInScroll() {
  const location = useLocation();

  useEffect(() => {
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
          (entries) => {
            entries.forEach((entry) => {
              const el = entry.target;
              const direction = el.getAttribute("data-direction") || "up";
              const distance = el.getAttribute("data-distance") || "40px";

              if (entry.isIntersecting) {
                el.style.opacity = "1";
                el.style.transform = "translate(0, 0)";
              } else {
                const axis =
                  direction === "left" || direction === "right" ? "X" : "Y";
                const sign =
                  direction === "up" || direction === "left" ? 1 : -1;
                el.style.opacity = "0";
                el.style.transform = `translate${axis}(${sign * distance})`;
              }
            });
          },
          { threshold: 0.15 }
        );
      }

      elements.forEach((el) => {
        el.setAttribute("data-fade-bound", "true");
        observer.observe(el);
      });
    };

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      mutationObserver.disconnect();
      observer?.disconnect();
    };
  }, [location.pathname]);
}
