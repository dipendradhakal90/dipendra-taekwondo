import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Lottie from "lottie-react";
import Container from "../components/common/Container";
import Footer from "./Footer";
import SiteChatbot from "../components/common/SiteChatbot";
import { useDarkMode } from "../context/DarkModeContext";
import { AboutAPI } from "../services/about.service";
import nepalFlagAnimation from "../assets/nepal-flag.json";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function NavItem({ to, label, isDark }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "text-sm xl:text-base font-semibold uppercase whitespace-nowrap transition outline-none rounded-xl px-1 py-1 " +
        "focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
        "dark:focus-visible:ring-offset-slate-950 " +
        (isActive
          ? isDark
            ? "text-white"
            : "text-black"
          : isDark
          ? "text-white/60 hover:text-white"
          : "text-black/60 hover:text-black")
      }
    >
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, onClick, isDark }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        "block px-4 py-3 rounded-lg text-lg font-semibold uppercase transition outline-none " +
        "focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
        "dark:focus-visible:ring-offset-slate-950 " +
        (isActive
          ? isDark
            ? "bg-blue-600 text-white"
            : "bg-black text-white"
          : isDark
          ? "text-white/60 hover:text-white hover:bg-white/10"
          : "text-black/60 hover:text-black hover:bg-black/5")
      }
    >
      {label}
    </NavLink>
  );
}

export default function PublicLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();
  const aboutQuery = useQuery({
    queryKey: ["navbar-owner-profile"],
    queryFn: AboutAPI.getPublic,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [swipeEdge, setSwipeEdge] = useState("");
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  function isSwipeBlockedTarget(target) {
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest(
      '[data-disable-page-swipe="true"], input, textarea, select, button, a, [role="dialog"]'
    );
  }

  function handlePageTouchStart(e) {
    if (window.innerWidth > 1024) return;
    if (mobileOpen) return;
    const touch = e.touches?.[0];
    if (!touch) return;
    if (isSwipeBlockedTarget(e.target)) return;

    const x = touch.clientX;
    const vw = window.innerWidth;
    const edge = 28;
    setTouchStartX(x);
    setTouchStartY(touch.clientY);

    if (x <= edge) setSwipeEdge("left");
    else if (x >= vw - edge) setSwipeEdge("right");
    else setSwipeEdge("");
  }

  function handlePageTouchEnd(e) {
    if (!swipeEdge) return;
    const touch = e.changedTouches?.[0];
    if (!touch) {
      setSwipeEdge("");
      return;
    }

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const minX = 72;

    // Prevent vertical scroll gestures from triggering navigation
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setSwipeEdge("");
      return;
    }

    if (swipeEdge === "left" && deltaX >= minX) navigate(-1);
    if (swipeEdge === "right" && deltaX <= -minX) navigate(1);
    setSwipeEdge("");
  }

  const navItems = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/achievements", label: "Achievements" },
    { to: "/certifications", label: "Certifications" },
    { to: "/media-coverage", label: "Media Coverage" },
    { to: "/gallery", label: "Gallery" },
    { to: "/updates", label: "Posts" },
    { to: "/contact", label: "Contact" },
  ];

  const ownerImage =
    aboutQuery.data?.profileImageUrl ||
    aboutQuery.data?.imageUrl ||
    aboutQuery.data?.profileImage ||
    aboutQuery.data?.photoUrl ||
    aboutQuery.data?.avatarUrl ||
    "";
  const ownerName = (aboutQuery.data?.profileName || "Dipendra Dhakal").trim() || "Dipendra Dhakal";
  const ownerTitle =
    (aboutQuery.data?.profileTitle || "International Taekwondo Referee").trim() ||
    "International Taekwondo Referee";

  return (
    <div className={cx("min-h-screen flex flex-col transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
      <header className={cx("sticky top-0 z-[99] border-b transition-all duration-300", isDark ? "border-white/10 bg-slate-900/95 backdrop-blur-xl" : "border-black/10 bg-white/95 backdrop-blur-xl")}>
        <div className="[padding-left:max(1rem,calc(env(safe-area-inset-left)+1rem))][padding-right:max(1rem,calc(env(safe-area-inset-right)+1rem))] px-[clamp(0.75rem,4vw,1.25rem)] h-[clamp(4.5rem,12vh,5.5rem)] flex items-center justify-between gap-[clamp(0.375rem,1.5vw,1rem)]">
          <div className="flex flex-1 items-center gap-[clamp(0.25rem,1.5vw,0.75rem)] min-w-0">
            <Link to="/" className="flex items-center gap-[clamp(0.25rem,1vw,0.5rem)] [&>*]:shrink-0">
              <div className={cx(
                "h-[clamp(2.75rem,9vh,4rem)] aspect-square rounded-full overflow-hidden border-[clamp(0.2rem,0.6vw,0.375rem)] shrink-0 bg-gradient-to-br",
                isDark ? "border-slate-600/80 bg-slate-800/50" : "border-slate-200 bg-slate-100"
              )}>
                {ownerImage ? (
                  <img
                    src={ownerImage}
                    alt={ownerName}
                    className="h-full w-full object-cover rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <div className={cx("h-full w-full grid place-items-center text-[clamp(0.875rem,2.5vw,1.125rem)] font-bold", isDark ? "text-slate-300" : "text-slate-700")}>
                    DD
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 max-w-[55vw]">
                <div className="inline-block rounded-lg bg-[#0b1f4d] text-white font-bold px-[clamp(0.375rem,1.5vw,0.75rem)] py-[clamp(0.25rem,0.75vh,0.375rem)] text-[clamp(0.875rem,2.5vw,1.125rem)] leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                  {ownerName}
                </div>
                <div className={cx(
                  "mt-[clamp(0.125rem,0.5vh,0.25rem)] text-[clamp(0.625rem,1.75vw,0.875rem)] font-medium overflow-hidden text-ellipsis",
                  isDark ? "text-white/70" : "text-black/60"
                )}>
                  {ownerTitle}
                </div>
              </div>
            </Link>
          </div>

          {/* Nepal flag - optional on very small screens */}
          <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-[clamp(3.5rem,11vw,4.5rem)] h-[clamp(4rem,13vh,5.5rem)] mx-[clamp(0.5rem,1.5vw,1rem)]">
            <Lottie
              animationData={nepalFlagAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full [&>path]:!stroke-current"
            />
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-[clamp(0.375rem,1.25vw,0.75rem)] flex-shrink-0 [&>*]:shrink-0">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 lg:gap-1.5">
              {navItems.map((item) => (
                <NavItem key={item.to} to={item.to} label={item.label} isDark={isDark} />
              ))}
            </nav>
            
            {/* Dark toggle */}
            <button
              onClick={toggleDarkMode}
              className={cx(
                "h-8 w-8 rounded-full flex items-center justify-center p-0 shadow-sm transition-all",
                isDark
                  ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200 hover:shadow-md"
                  : "bg-slate-900/10 border border-slate-900/30 text-slate-700 hover:text-slate-900 hover:shadow-md"
              )}
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 5.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            {/* Hamburger - highest priority */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cx(
                "lg:hidden w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all shrink-0",
                isDark
                  ? "bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25"
                  : "bg-white/80 backdrop-blur border border-black/10 text-black hover:bg-white shadow-md hover:shadow-lg"
              )}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X size={22} className="shrink-0" /> : <Menu size={22} className="shrink-0" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              id="mobile-nav"
              className={cx("xl:hidden border-t overflow-hidden transition-colors duration-300", isDark ? "border-white/10 bg-slate-900" : "border-black/10 bg-white")}
            >
              <Container>
                <div className="py-4 space-y-2">
                  {navItems.map((item) => (
                    <MobileNavItem
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      onClick={() => setMobileOpen(false)}
                      isDark={isDark}
                    />
                  ))}

                  <div className="flex items-center gap-2 px-4">
                    <button
                      onClick={toggleDarkMode}
                      className={cx(
                        "h-8 w-8 flex items-center justify-center shrink-0 p-0",
                        isDark ? "text-yellow-300 hover:text-yellow-200" : "text-slate-700 hover:text-slate-900"
                      )}
                      title="Toggle dark mode"
                      aria-label="Toggle dark mode"
                    >
                      {isDark ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 5.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1" onTouchStart={handlePageTouchStart} onTouchEnd={handlePageTouchEnd}>
        {children}
      </main>

      <Footer />
      {!location.pathname.startsWith("/admin") ? <SiteChatbot /> : null}
    </div>
  );
}

