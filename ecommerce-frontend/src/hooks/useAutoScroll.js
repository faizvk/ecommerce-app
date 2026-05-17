import { useEffect, useRef } from "react";

/**
 * Auto-scrolls a horizontally-overflowing container leftward via RAF, while
 * still allowing the user to manually scroll, touch-drag, wheel, or
 * keyboard-arrow through it. Manual interaction pauses the auto-scroll for
 * `resumeDelay` ms; after that it picks up from wherever the user left off.
 *
 * For seamless looping the consumer must render the items TWICE inside the
 * scrolled element. When scrollLeft reaches half of scrollWidth, we subtract
 * half — invisible because the same content sits at both positions.
 *
 * @param {React.RefObject<HTMLElement>} ref - the overflow-x-auto container
 * @param {object} [options]
 * @param {number} [options.speed=0.5]        - px per frame (~30px/s at 60fps)
 * @param {number} [options.resumeDelay=2000] - ms before resuming after interaction
 * @param {boolean} [options.enabled=true]    - master switch
 */
export function useAutoScroll(ref, { speed = 0.5, resumeDelay = 2000, enabled = true } = {}) {
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // Respect users who explicitly prefer reduced motion.
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduceMotion) return;

    let rafId = 0;

    const pause = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, resumeDelay);
    };

    // Pause only on explicit input interactions — NOT on hover. Hover-pause
    // sounds nice but it stops the scroll the moment the cursor crosses the
    // strip (which spans most of the page), making the feature look broken.
    el.addEventListener("pointerdown", pause);
    el.addEventListener("touchmove",   pause, { passive: true });
    el.addEventListener("wheel",       pause, { passive: true });
    el.addEventListener("keydown",     pause);

    // Use a float accumulator — sub-pixel speed values (e.g. 0.45) would
    // otherwise be truncated by scrollLeft's integer snap on some browsers.
    let acc = 0;

    const loop = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          acc += speed;
          const step = Math.floor(acc);
          if (step >= 1) {
            acc -= step;
            if (el.scrollLeft >= half) {
              // Seamless wrap — works because content is rendered twice
              el.scrollLeft = el.scrollLeft - half;
            }
            el.scrollLeft += step;
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchmove",   pause);
      el.removeEventListener("wheel",       pause);
      el.removeEventListener("keydown",     pause);
    };
  }, [ref, speed, resumeDelay, enabled]);
}
