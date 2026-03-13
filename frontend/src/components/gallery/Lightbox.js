import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";

export default function Lightbox({ items = [], startIndex = 0, onClose }) {
  const { isDark } = useDarkMode();
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [zoom, setZoom] = useState(1);
  const [dragEnabled, setDragEnabled] = useState(false);

  const thumbStripRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const activeItem = useMemo(() => items?.[activeIndex], [items, activeIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    setActiveIndex(startIndex);
    setZoom(1);
    setDragEnabled(false);
  }, [startIndex]);

  function prev() {
    setZoom(1);
    setDragEnabled(false);
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    setZoom(1);
    setDragEnabled(false);
    setActiveIndex((i) => (i + 1) % items.length);
  }

  function close() {
    setZoom(1);
    setDragEnabled(false);
    onClose?.();
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function onDoubleClickZoom() {
    const newZoom = zoom === 1 ? 1.8 : 1;
    setZoom(newZoom);
    setDragEnabled(newZoom !== 1);
  }

  function onTouchStart(e) {
    const touch = e.touches?.[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  }

  function onTouchEnd(e) {
    if (items.length <= 1 || zoom !== 1) return;
    const touch = e.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const minSwipe = 48;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < minSwipe) return;

    if (deltaX < 0) next();
    else prev();
  }

  useEffect(() => {
    const el = thumbStripRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIndex]);

  if (!activeItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-disable-page-swipe="true"
        className={isDark ? "fixed inset-0 z-[9999] bg-black/90" : "fixed inset-0 z-[9999] bg-white/90"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between gap-3 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={isDark ? "text-white/80 text-sm font-semibold" : "text-black/80 text-sm font-semibold"}>
            {activeItem.title || "Gallery"}{" "}
            <span className={isDark ? "text-white/40" : "text-black/40"}>
              ({activeIndex + 1}/{items.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={isDark ? "rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-white hover:bg-white/20" : "rounded-xl px-3 py-2 text-sm font-semibold bg-black/5 text-black hover:bg-black/10"}
              onClick={() => {
                const newZoom = Math.max(1, zoom - 0.2);
                setZoom(newZoom);
                setDragEnabled(newZoom !== 1);
              }}
            >
              -
            </button>
            <button
              className={isDark ? "rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-white hover:bg-white/20" : "rounded-xl px-3 py-2 text-sm font-semibold bg-black/5 text-black hover:bg-black/10"}
              onClick={() => {
                const newZoom = Math.min(2.6, zoom + 0.2);
                setZoom(newZoom);
                setDragEnabled(newZoom !== 1);
              }}
            >
              +
            </button>
            <button
              className={isDark ? "rounded-xl px-3 py-2 text-sm font-semibold bg-white/10 text-white hover:bg-white/20" : "rounded-xl px-3 py-2 text-sm font-semibold bg-black/5 text-black hover:bg-black/10"}
              onClick={close}
              aria-label="Close"
            >
              x
            </button>
          </div>
        </div>

        {items.length > 1 ? (
          <button
            className={isDark ? "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 px-2 text-white/90 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white" : "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 px-2 text-black/80 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.85)] hover:text-black"}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
          >
            {"<"}
          </button>
        ) : null}

        {items.length > 1 ? (
          <button
            className={isDark ? "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 px-2 text-white/90 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white" : "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 px-2 text-black/80 text-[28px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(255,255,255,0.85)] hover:text-black"}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
          >
            {">"}
          </button>
        ) : null}

        <div
          className="h-full w-full flex items-center justify-center px-4 pb-24 pt-16"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <motion.img
            key={activeItem.imageUrl}
            src={activeItem.imageUrl}
            alt={activeItem.title || ""}
            className="max-h-[70vh] w-auto select-none cursor-zoom-in"
            draggable={false}
            onDoubleClick={onDoubleClickZoom}
            drag={dragEnabled}
            dragMomentum={false}
            dragElastic={0.08}
            whileTap={{ cursor: dragEnabled ? "grabbing" : "zoom-in" }}
            whileHover={{ cursor: dragEnabled ? "grab" : "zoom-in" }}
            initial={{ opacity: 0.2, scale: 0.985 }}
            animate={{ opacity: 1, scale: zoom }}
            transition={{ duration: 0.18 }}
          />
        </div>

        {items.length > 1 ? (
          <div
            className={isDark ? "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent" : "absolute left-0 right-0 bottom-0 p-3 bg-gradient-to-t from-white/70 to-transparent"}
            onClick={(e) => e.stopPropagation()}
          >
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
                    data-idx={idx}
                    onClick={() => {
                      setZoom(1);
                      setDragEnabled(false);
                      setActiveIndex(idx);
                    }}
                    className={
                      "shrink-0 rounded-xl overflow-hidden border transition " +
                      (active ? (isDark ? "border-white" : "border-black") : (isDark ? "border-white/20 hover:border-white/50" : "border-black/20 hover:border-black/50"))
                    }
                  >
                    <img src={t.imageUrl} alt={t.title || ""} className="h-14 w-20 object-cover" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
