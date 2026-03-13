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
      <header className={cx("sticky top-0 z-40 border-b transition-colors duration-300 overflow-hidden", isDark ? "border-white/10 bg-slate-900/80" : "border-black/10 bg-white/80", "backdrop-blur")}>
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 sm:h-24 lg:h-28 flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Link to="/" className="flex items-center gap-2 sm:gap-3">
                <div className={cx("h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full overflow-hidden border-4 shrink-0 flex", isDark ? "border-slate-500 bg-slate-800" : "border-slate-200 bg-slate-100")}>
                  {ownerImage ? (
                    <img
                      src={ownerImage}
                      alt={ownerName}
                      className="h-full w-full object-cover rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className={cx("h-full w-full grid place-items-center text-lg font-bold", isDark ? "text-slate-300" : "text-slate-700")}>
                      DD
                    </div>
                  )}
                </div>
                <div className="leading-tight min-w-0 max-w-[200px] sm:max-w-[280px] lg:max-w-[380px]">
                  <div className="inline-block rounded-lg bg-[#0b1f4d] text-white font-bold px-2 py-1 sm:px-4 sm:py-2 text-base sm:text-xl lg:text-2xl truncate">
                    {ownerName}
                  </div>
                  <div className={cx("mt-0.5 text-xs sm:text-sm lg:text-base font-medium truncate", isDark ? "text-white/70" : "text-black/60")}>
                    {ownerTitle}
                  </div>
                </div>
              </Link>
            </div>

              {/* Responsive Nepal flag */}
              <div className="hidden sm:ml-4 sm:block w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 mx-auto">
                <Lottie
                  animationData={nepalFlagAnimation}
                  loop={true}
                  autoplay={true}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className={cx(
                  "h-8 w-8 rounded-full flex items-center justify-center p-0",
                  isDark
                    ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200"
                    : "bg-slate-900/10 border border-slate-900/30 text-slate-700 hover:text-slate-900"
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
              
              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-2 lg:gap-3">
                {navItems.map((item) => (
                  <NavItem key={item.to} to={item.to} label={item.label} isDark={isDark} />
                ))}
              </nav>
              
              {/* Hamburger - mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cx(
                  "lg:hidden p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg",
                  isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div> {/* Right Section */}
          </div> {/* Navbar container */}

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
