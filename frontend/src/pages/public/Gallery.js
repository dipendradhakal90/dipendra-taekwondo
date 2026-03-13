import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryAPI } from "../../services/gallery.service";

import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import Reveal from "../../components/ui/Reveal";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function LightboxPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function Gallery() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["gallery-page"],
    queryFn: GalleryAPI.list,
  });

  const items = useMemo(() => q.data || [], [q.data]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [scale, setScale] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false);

  const thumbStripRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const activeItem = items[activeIndex];

  const openLightbox = (index) => {
    setActiveIndex(index);
    setScale(1);
    setDragEnabled(false);
    setOpen(true);
  };

  const closeLightbox = () => {
    setOpen(false);
    setScale(1);
    setDragEnabled(false);
  };

  const prevImage = () => {
    if (!items.length) return;
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
    setScale(1);
    setDragEnabled(false);
  };

  const nextImage = () => {
    if (!items.length) return;
    setActiveIndex((i) => (i + 1) % items.length);
    setScale(1);
    setDragEnabled(false);
  };

  // keep active thumb visible
  useEffect(() => {
    if (!open) return;
    const strip = thumbStripRef.current;
    if (!strip) return;

    const el = strip.querySelector(`[data-thumb="${activeIndex}"]`);
    if (!el) return;

    const elRect = el.getBoundingClientRect();
    const stripRect = strip.getBoundingClientRect();

    if (elRect.left < stripRect.left || elRect.right > stripRect.right) {
      const left = el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2;
      strip.scrollTo({ left, behavior: "smooth" });
    }
  }, [activeIndex, open]);

  // ESC / arrows + body lock
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items.length]);

  const onWheelZoom = (e) => {
    if (!open) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setScale((s) => {
      const next = clamp(Number((s + delta).toFixed(2)), 1, 3);
      setDragEnabled(next > 1);
      return next;
    });
  };

  const onDoubleClickZoom = () => {
    setScale((s) => {
      const next = s === 1 ? 2 : 1;
      setDragEnabled(next > 1);
      return next;
    });
  };

  const onTouchStart = (e) => {
    const touch = e.touches?.[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const onTouchEnd = (e) => {
    if (items.length <= 1 || scale !== 1) return;
    const touch = e.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const minSwipe = 48;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < minSwipe) return;

    if (deltaX < 0) nextImage();
    else prevImage();
  };

  return (
    <>
      <PageHead
        title="Gallery"
        description="View a curated gallery of memorable moments, training sessions, and taekwondo achievements."
        path="/gallery"
      />
      <div className={cx("transition-colors duration-300 min-h-screen", isDark ? "bg-slate-950" : "bg-white")}>
      <Section
        title="Gallery"
        topPaddingClass="pt-20 md:pt-24"
        subtitle="Browse official moments in a premium fullscreen lightbox."
        isDark={isDark}
        right={<span className={cx("text-sm font-semibold", isDark ? "text-white/60" : "text-black/60")}>{items.length ? `${items.length} photos` : ""}</span>}
      >
        {q.isLoading ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <Skeleton className="h-44 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : items.length ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((g, i) => (
              <div key={g._id || g.imageUrl || i} className="break-inside-avoid">
                <Reveal delay={i * 0.02}>
                  <button
                    type="button"
                    onClick={() => openLightbox(i)}
                    className={cx("group w-full overflow-hidden rounded-2xl border shadow-sm hover:shadow-soft transition focus:outline-none focus:ring-2", isDark ? "border-white/10 bg-slate-800 focus:ring-white/20" : "border-black/10 bg-white focus:ring-black/20")}
                    title="Open image"
                  >
                    <div className="relative">
                      <img
                        src={g.imageUrl}
                        alt={g.title || ""}
                        className="w-full h-auto object-cover transition duration-500 group-hover:scale-[1.08]"
                        loading="lazy"
                      />
                    </div>

                    {(g.title || g.album || g.category) ? (
                      <div className={cx("p-3 text-left", isDark ? "bg-slate-800" : "bg-white")}>
                        {g.title ? <div className={cx("font-bold text-sm", isDark ? "text-white" : "text-black")}>{g.title}</div> : null}
                        {(g.album || g.category) ? (
                          <div className={cx("text-xs mt-1", isDark ? "text-white/60" : "text-black/60")}>{g.album || g.category}</div>
                        ) : null}
                      </div>
                    ) : null}
                  </button>
                </Reveal>
              </div>
            ))}
          </div>
        ) : (
          <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>No gallery images yet.</Card>
        )}
      </Section>
      </div>

      {/* âœ… Portal lightbox to prevent navbar cut after scroll */}
      <AnimatePresence>
        {open && activeItem ? (
          <LightboxPortal>
            <motion.div
              data-disable-page-swipe="true"
              className={isDark ? "fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm" : "fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              role="dialog"
              aria-modal="true"
            >
              <div className="h-[100dvh] w-full flex items-center justify-center p-4">
                <motion.div
                  className="relative w-full max-w-6xl"
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className={isDark ? "text-white/90 text-sm font-semibold truncate" : "text-black/90 text-sm font-semibold truncate"}>
                        {activeItem.title || "Gallery Image"}
                        <span className={isDark ? "text-white/50 font-normal" : "text-black/50 font-normal"}>
                          {" "}
                          - {activeIndex + 1}/{items.length}
                        </span>
                      </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={activeItem.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={isDark ? "hidden sm:inline-flex items-center justify-center rounded-xl px-3 py-2 bg-white/10 text-white text-xs font-semibold hover:bg-white/15 border border-white/10" : "hidden sm:inline-flex items-center justify-center rounded-xl px-3 py-2 bg-black/5 text-black text-xs font-semibold hover:bg-black/10 border border-black/10"}
                      >
                        Open original
                      </a>

                      <button
                        type="button"
                        className={isDark ? "inline-flex items-center justify-center rounded-xl px-3 py-2 bg-white/10 text-white text-xs font-bold hover:bg-white/20" : "inline-flex items-center justify-center rounded-xl px-3 py-2 bg-black/5 text-black text-xs font-bold hover:bg-black/10"}
                        onClick={closeLightbox}
                        aria-label="Close"
                      >
                        x
                      </button>
                    </div>
                  </div>

                  <div className={isDark ? "relative rounded-3xl overflow-hidden border border-white/10 bg-black" : "relative rounded-3xl overflow-hidden border border-black/10 bg-white"}>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        className={isDark ? "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 px-2 text-white/90 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white" : "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 px-2 text-black/80 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.85)] hover:text-black"}
                        onClick={prevImage}
                        aria-label="Previous"
                      >
                        {"<"}
                      </button>
                    ) : null}

                    {items.length > 1 ? (
                      <button
                        type="button"
                        className={isDark ? "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 px-2 text-white/90 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white" : "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 px-2 text-black/80 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.85)] hover:text-black"}
                        onClick={nextImage}
                        aria-label="Next"
                      >
                        {">"}
                      </button>
                    ) : null}
                    <div className="w-full h-[70dvh] flex items-center justify-center" onWheel={onWheelZoom} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                      <motion.img
                        key={activeItem.imageUrl}
                        src={activeItem.imageUrl}
                        alt={activeItem.title || ""}
                        className="max-h-[70dvh] w-auto select-none cursor-zoom-in"
                        draggable={false}
                        onDoubleClick={onDoubleClickZoom}
                        drag={dragEnabled}
                        dragMomentum={false}
                        dragElastic={0.08}
                        whileTap={{ cursor: dragEnabled ? "grabbing" : "zoom-in" }}
                        whileHover={{ cursor: dragEnabled ? "grab" : "zoom-in" }}
                        animate={{ opacity: 1, scale }}
                        initial={{ opacity: 0.2, scale: 0.985 }}
                        transition={{ duration: 0.18 }}
                      />
                    </div>

                    {items.length > 1 ? (
                      <div className={isDark ? "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" : "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-white/70 via-white/30 to-transparent"}>
                        <div
                          ref={thumbStripRef}
                          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
                          {items.map((t, idx) => {
                            const active = idx === activeIndex;
                            return (
                              <button
                                key={t._id || t.imageUrl || idx}
                                type="button"
                                data-thumb={idx}
                                onClick={() => {
                                  setActiveIndex(idx);
                                  setScale(1);
                                  setDragEnabled(false);
                                }}
                                className={
                                  "shrink-0 rounded-xl overflow-hidden border transition " +
                                  (active
                                    ? (isDark ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" : "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.06)]")
                                    : (isDark ? "border-white/10 opacity-80 hover:opacity-100" : "border-black/10 opacity-80 hover:opacity-100"))
                                }
                                title={t.title || `Image ${idx + 1}`}
                              >
                                <img src={t.imageUrl} alt={t.title || ""} className="h-14 w-20 object-cover" loading="lazy" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </LightboxPortal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
