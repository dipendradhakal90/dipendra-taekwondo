import { useEffect, useMemo, useRef, useState } from "react"; 
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { GalleryAPI } from "../../services/gallery.service";
import { HomeAPI } from "../../services/home.service";
import { useDarkMode } from "../../context/DarkModeContext";

function shuffle(arr) {
  return arr
    .map((x) => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ x }) => x);
}

export default function HeroCarousel() {
  const { isDark } = useDarkMode();
  const q = useQuery({
  queryKey: ["hero-gallery"],
  queryFn: async () => {
    const featured = await HomeAPI.featured();
    // if admin has featured gallery items, use them
    if (featured?.gallery?.length) return featured.gallery;
    // fallback to all gallery
    return await GalleryAPI.list();
  },
});


  const [items, setItems] = useState([]);
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  // Prepare random slides from gallery
  useEffect(() => {
    if (q.data?.length) {
      const picks = shuffle(q.data).slice(0, Math.min(12, q.data.length));
      setItems(picks);
      setIdx(0);
    }
  }, [q.data]);

  const current = useMemo(() => items[idx], [items, idx]);

  // Auto-slide like reference site (slick default autoplaySpeed)
  useEffect(() => {
    if (!items.length) return;

    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setIdx((i) => (i + 1) % items.length);
    }, 3000);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [items]);

  if (q.isLoading) {
    return (
      <div
        className={`w-full animate-pulse ${isDark ? "bg-slate-700" : "bg-gray-200"} h-[38dvh] min-h-[220px] sm:h-[46dvh] md:h-[58dvh] lg:h-[calc(100dvh-4rem)]`}
      />
    );
  }

  if (!items.length) {
    return (
      <div
        className={`w-full grid place-items-center ${isDark ? "text-slate-400 bg-slate-900" : "text-gray-400 bg-gray-50"} h-[38dvh] min-h-[220px] sm:h-[46dvh] md:h-[58dvh] lg:h-[calc(100dvh-4rem)]`}
      >
        Upload a few images in Gallery to activate the slider.
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden transition-colors duration-300 h-[38dvh] min-h-[220px] sm:h-[46dvh] md:h-[58dvh] lg:h-[calc(100dvh-4rem)] ${isDark ? "bg-slate-900" : "bg-white"}`}
    >
      <div className="h-full">
        <div
          className={`w-full h-full overflow-hidden border-y border-black/10 relative ${isDark ? "bg-slate-950" : "bg-black/[0.04]"}`}
        >
          <AnimatePresence>
            <motion.div
              key={current?.imageUrl}
              className="absolute inset-0 z-0"
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'ease' }}
            >
              {/* Background fill keeps slider edge-to-edge without blank bands */}
              <img
                src={current.imageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center scale-110 blur-xl opacity-45"
                loading="lazy"
              />
              <img
                src={current.imageUrl}
                alt={current.title || 'Slide'}
                className="relative z-[1] h-full w-full object-contain object-center"
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="pointer-events-none absolute z-20 left-0 right-0 bottom-8 sm:bottom-9">
            <div className={`${isDark ? "bg-black/50" : "bg-black/45"} px-3 py-2 sm:px-4 sm:py-2.5`}>
              <div className="w-full text-white font-semibold text-sm sm:text-base md:text-lg leading-snug break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] text-center">
              {current.title || current.album || "Official Moments"}
              </div>
            </div>
          </div>

          {/* Dots positioned inside the centered card */}
          <div className="absolute z-30 right-4 bottom-4 sm:right-6 sm:bottom-5 flex gap-2">
            {items.slice(0, 8).map((_, i) => (
                <button
                key={i}
                onClick={() => setIdx(i)}
                className={
                  "h-1.5 w-4 rounded-full border transition " +
                  (i === idx
                    ? isDark
                      ? "bg-white border-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
                      : "bg-black border-black shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                    : isDark
                    ? "bg-white/45 border-white/70 hover:bg-white/70"
                    : "bg-black/35 border-black/60 hover:bg-black/60")
                }
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
