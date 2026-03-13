import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import Section from "../ui/Section";
import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";
import Reveal from "../ui/Reveal";
import { HomeAPI } from "../../services/home.service";
import { GalleryAPI } from "../../services/gallery.service";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function LightboxPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function FeaturedGallery() {
  const { isDark } = require("../../context/DarkModeContext").useDarkMode();
  const featuredQ = useQuery({ queryKey: ["home-featured"], queryFn: HomeAPI.featured });

  // fallback if no featured gallery returned
  const galleryQ = useQuery({
    queryKey: ["home-gallery"],
    queryFn: async () => (await GalleryAPI.list()).slice(0, 12),
  });

  const items = useMemo(() => {
    const featured = featuredQ.data?.gallery || featuredQ.data?.galleries || featuredQ.data?.galleryItems;
    const list = Array.isArray(featured) && featured.length ? featured : galleryQ.data;
    return list || [];
  }, [featuredQ.data, galleryQ.data]);

  // Lightbox
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [scale, setScale] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false);

  const thumbStripRef = useRef(null);
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

  return (
    <>
      <Section
        title="Featured Gallery"
        subtitle="Official moments captured from championships and achievements."
        right={
            <Link className={isDark ? "text-sm font-semibold text-white/60 hover:text-white transition" : "text-sm font-semibold text-black/60 hover:text-black transition"} to="/gallery">
              View all →
            </Link>
          }
      >
        {(featuredQ.isLoading || galleryQ.isLoading) ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0">
                <Skeleton className="h-44 w-[260px] rounded-3xl" />
              </div>
            ))}
          </div>
        ) : items?.length ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {items.slice(0, 12).map((g, i) => (
              <Reveal key={g._id || g.imageUrl || i} delay={i * 0.03}>
                {/* ✅ FIX: strict size + object-cover (prevents tiny width images) */}
                <button
                  type="button"
                  onClick={() => openLightbox(i)}
                  className={isDark ? "group shrink-0 rounded-3xl border border-white/10 bg-slate-800 shadow-sm hover:shadow-soft transition overflow-hidden w-[260px]" : "group shrink-0 rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-soft transition overflow-hidden w-[260px]"}
                  title="Open image"
                >
                  <div className="relative h-44 w-[260px]">
                    <img
                      src={g.imageUrl}
                      alt={g.title || ""}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                  </div>

                  {(g.title || g.album || g.category) ? (
                    <div className="p-3 text-left">
                      {g.title ? <div className="font-bold text-sm line-clamp-1">{g.title}</div> : null}
                      {(g.album || g.category) ? (
                        <div className={isDark ? "text-xs text-white/60 mt-1 line-clamp-1" : "text-xs text-black/60 mt-1 line-clamp-1"}>
                          {g.album || g.category}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="p-3 text-left">
                      <div className={cx("text-xs", isDark ? "text-white/50" : "text-black/50")}>Gallery</div>
                    </div>
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className={isDark ? "p-6 text-white/60" : "p-6 text-black/60"}>No featured gallery images yet.</Card>
        )}
      </Section>

      {/* ✅ FIX #2: Portal lightbox (prevents cutting under navbar after scroll) */}
      <AnimatePresence>
        {open && activeItem ? (
          <LightboxPortal>
            <motion.div
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
                          • {activeIndex + 1}/{items.length}
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
                        className={isDark ? "inline-flex items-center justify-center rounded-xl px-3 py-2 bg-white text-black text-xs font-bold hover:bg-white/90" : "inline-flex items-center justify-center rounded-xl px-3 py-2 bg-black text-white text-xs font-bold hover:bg-black/90"}
                        onClick={closeLightbox}
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className={isDark ? "relative rounded-3xl overflow-hidden border border-white/10 bg-black" : "relative rounded-3xl overflow-hidden border border-black/10 bg-white"}>
                    {items.length > 1 ? (
                      <button
                        type="button"
                        className={isDark ? "absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/90 text-black h-11 w-11 flex items-center justify-center shadow-sm border border-black/10 hover:bg-white" : "absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/90 text-white h-11 w-11 flex items-center justify-center shadow-sm border border-black/10 hover:bg-black"}
                        onClick={prevImage}
                        aria-label="Previous"
                      >
                        ‹
                      </button>
                    ) : null}

                    {items.length > 1 ? (
                      <button
                        type="button"
                        className={cx("absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full h-11 w-11 flex items-center justify-center shadow-sm border", isDark ? "bg-black/90 text-white border-white/10 hover:bg-black" : "bg-white/90 text-black border-black/10 hover:bg-white")}
                        onClick={nextImage}
                        aria-label="Next"
                      >
                        ›
                      </button>
                    ) : null}

                    <div className={isDark ? "absolute left-4 top-4 z-10 text-[11px] font-semibold text-white/70 bg-black/30 border border-white/10 rounded-full px-3 py-2" : "absolute left-4 top-4 z-10 text-[11px] font-semibold text-black/70 bg-white/30 border border-black/10 rounded-full px-3 py-2"}>
                      Wheel to zoom • Double-click • Drag when zoomed
                    </div>

                    <div className="w-full h-[70dvh] flex items-center justify-center" onWheel={onWheelZoom}>
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
                      <div className="absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                        <div
                          ref={thumbStripRef}
                          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
                          {items.length > 1 ? (
                            <div className={isDark ? "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" : "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-white/70 via-white/30 to-transparent"}>
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
                                    ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]"
                                    : "border-white/10 opacity-80 hover:opacity-100")
                                }
                                title={t.title || `Image ${idx + 1}`}
                                      className={
                                        "shrink-0 rounded-xl overflow-hidden border transition " +
                                        (active
                                          ? (isDark ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" : "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.06)]")
                                          : (isDark ? "border-white/10 opacity-80 hover:opacity-100" : "border-black/10 opacity-80 hover:opacity-100"))
                                      }
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className={isDark ? "mt-3 flex items-center justify-between text-white/60 text-xs" : "mt-3 flex items-center justify-between text-black/60 text-xs"}>
                    <div>ESC to close • ← → to navigate</div>
                    <div className={isDark ? "text-white/50" : "text-black/50"}>Zoom: {Math.round(scale * 100)}%</div>
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
