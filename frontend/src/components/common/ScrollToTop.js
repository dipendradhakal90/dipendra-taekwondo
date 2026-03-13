import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash exists (#section), let browser handle it
    if (hash) return;

    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname, hash]);

  return null;
}