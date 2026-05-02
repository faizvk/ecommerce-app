import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets the window scroll position whenever the route changes.
// Place inside <BrowserRouter> (e.g., near top of App's Routes).
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
