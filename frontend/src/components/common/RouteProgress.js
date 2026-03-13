import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

export default function RouteProgress() {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => NProgress.done(), 350);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return null;
}
