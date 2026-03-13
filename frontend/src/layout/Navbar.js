// frontend/src/layout/Navbar.js
import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import { useDarkMode } from "../context/DarkModeContext";

import { AboutAPI } from "../services/about.service";
import { GalleryAPI } from "../services/gallery.service";
import { PostsAPI } from "../services/posts.service";
import { AchievementsAPI } from "../services/achievements.service";
import { CertificationsAPI } from "../services/certifications.service";
import { MediaCoverageAPI } from "../services/media-coverage.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const nav = [
  { to: "/", label: "H", full: "Home" },
  { to: "/about", label: "A", full: "About" },
  { to: "/achievements", label: "Ac", full: "Achieve" },
  { to: "/certifications", label: "Ce", full: "Certs" },
  { to: "/media-coverage", label: "M", full: "Media" },
  { to: "/gallery", label: "G", full: "Gallery" },
  { to: "/updates", label: "P", full: "Posts" },
  { to: "/contact", label: "C", full: "Contact" },
];

export default function Navbar() {
  const location = useLocation();
  const qc = useQueryClient();
  const { isDark, toggleDarkMode } = useDarkMode();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // hide/show on scroll
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 8);

      const goingDown = y > lastY.current;
      const farEnough = y > 120;

      // hide only after some scroll, show on scroll up
      if (farEnough && goingDown) setHidden(true);
      else setHidden(false);

      lastY.current = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prefetch on hover/focus (fast “premium” feel)
  const prefetch = (to) => {
    try {
      if (to === "/about") {
        qc.prefetchQuery({ queryKey: ["about-public"], queryFn: AboutAPI.getPublic });
      }
      if (to === "/gallery") {
        qc.prefetchQuery({ queryKey: ["gallery-page"], queryFn: GalleryAPI.list });
      }
      if (to === "/updates") {
        qc.prefetchQuery({ queryKey: ["updates-page"], queryFn: PostsAPI.listPublished });
      }
      if (to === "/achievements") {
        qc.prefetchQuery({ queryKey: ["home-achievements"], queryFn: AchievementsAPI.list });
      }
      if (to === "/certifications") {
        qc.prefetchQuery({ queryKey: ["home-certs"], queryFn: CertificationsAPI.list });
      }
      // awards prefetched on certifications page now
      if (to === "/media-coverage") {
        qc.prefetchQuery({ queryKey: ["media-coverage-public"], queryFn: MediaCoverageAPI.listPublished });
      }
    } catch {
      // ignore
    }
  };

  const linkBase =
    "relative px-0.5 py-1 rounded text-[9px] font-bold transition outline-none focus:ring-2 focus:ring-black/10 h-7 w-7 flex items-center justify-center";

  const linkInactive = isDark
    ? "text-white/70 hover:text-white hover:bg-white/[0.08]"
    : "text-black/70 hover:text-black hover:bg-black/[0.04]";
  const linkActive = isDark ? "text-white" : "text-black";

  return (
    <motion.header
      className={cx(
        "fixed top-0 left-0 right-0 z-[1000]",
        "transition-transform duration-300"
      )}
      animate={{ y: hidden ? -90 : 0 }}
    >
      <div
        className={cx(
          "w-full max-w-6xl mx-auto transition-colors duration-300 flex",
          scrolled
            ? isDark
              ? "backdrop-blur-xl bg-slate-900/70 border-b border-white/10 shadow-sm"
              : "backdrop-blur-xl bg-white/70 border-b border-black/10 shadow-sm"
            : isDark
            ? "backdrop-blur-md bg-slate-900/40"
            : "backdrop-blur-md bg-white/40"
        )}
      >
        <div className="h-16 flex items-center px-4 mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-start gap-1 w-full">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-1 shrink-0">
              <div className={cx("h-7 w-7 rounded text-white grid place-items-center font-extrabold text-[10px]", isDark ? "bg-blue-600" : "bg-black")}>
                T
              </div>
            </Link>

            {/* Desktop nav - using abbreviations */}
            <nav className="hidden md:flex items-center gap-0 shrink-0 ml-2">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onMouseEnter={() => prefetch(n.to)}
                  onFocus={() => prefetch(n.to)}
                  className={({ isActive }) =>
                    cx(linkBase, isActive ? linkActive : linkInactive)
                  }
                  title={n.full}
                >
                  {({ isActive }) => (
                    <>
                      <span>{n.label}</span>
                      {/* underline */}
                      <span
                        className={cx(
                          "absolute left-0.5 right-0.5 -bottom-0.5 h-px rounded-full transition",
                          isActive ? (isDark ? "bg-white" : "bg-black") : "bg-transparent"
                        )}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Spacer */}
            <div className="hidden md:block flex-1 min-w-0" />

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={cx(
                "shrink-0 h-7 w-7 rounded flex items-center justify-center transition-all",
                isDark
                  ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-300"
                  : "bg-slate-900/20 border border-slate-900/40 text-slate-700"
              )}
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 5.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Mobile button */}
            <button
              className={cx(
                "md:hidden rounded border px-1.5 py-1 text-xs font-bold transition shrink-0",
                isDark
                  ? "border-white/10 bg-white/10 text-white"
                  : "border-black/10 bg-white/70 backdrop-blur"
              )}
              onClick={() => setOpen((v) => !v)}
              aria-label="Open menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
                    <motion.div
                      className={cx(
                        "lg:hidden fixed inset-0 z-[1100]",
                        isDark && "dark"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div
                        className={cx(
                          "absolute inset-0",
                          isDark ? "bg-black/70" : "bg-black/50"
                        )}
                        onClick={() => setOpen(false)}
                      />
                      <motion.div
                        className={cx(
                          "absolute right-0 top-0 h-full w-[90%] max-w-sm shadow-xl",
                          "border-l",
                          isDark
                            ? "bg-slate-900 border-white/10"
                            : "bg-white border-black/10"
                        )}
                        initial={{ x: 40, opacity: 0.6 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 40, opacity: 0.6 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div
                          className={cx(
                            "p-5 border-b",
                            isDark ? "border-white/10" : "border-black/10"
                          )}
                        >
                          <div
                            className={cx(
                              "text-lg font-extrabold",
                              isDark ? "text-white" : "text-black"
                            )}
                          >
                            Menu<span className="text-brand-500">.</span>
                          </div>
                          <div
                            className={cx(
                              "text-sm mt-1",
                              isDark ? "text-white/60" : "text-black/60"
                            )}
                          >
                            Navigate quickly
                          </div>
                        </div>
          
                        <div className="p-4 grid gap-2">
                          {nav.map((n) => (
                            <NavLink
                              key={n.to}
                              to={n.to}
                              onMouseEnter={() => prefetch(n.to)}
                              onFocus={() => prefetch(n.to)}
                              className={({ isActive }) =>
                                cx(
                                  "rounded-lg px-4 py-3 font-semibold transition border text-sm",
                                  isActive
                                    ? isDark
                                      ? "bg-white/10 text-white border-white/10"
                                      : "bg-black text-white border-black"
                                    : isDark
                                    ? "bg-white/5 text-white/80 border-transparent hover:bg-white/10"
                                    : "bg-white text-black/80 border-black/10 hover:bg-black/5"
                                )
                              }
                            >
                              {n.full}
                            </NavLink>
                          ))}
          
                          <div className="pt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={toggleDarkMode}
                                className={cx(
                                  "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                                  isDark
                                    ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-300"
                                    : "bg-slate-900/20 border border-slate-900/40 text-slate-700"
                                )}
                                title="Toggle dark mode"
                                aria-label="Toggle dark mode"
                              >
                                {isDark ? (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 5.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>

                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}


