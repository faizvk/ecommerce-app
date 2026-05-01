import { useEffect, useRef, useCallback } from "react";

export function useDebouncedCallback(callback, delay = 600) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => { callbackRef.current = callback; }, [callback]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
  }, [delay]);
}
