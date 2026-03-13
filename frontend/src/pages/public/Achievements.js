import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import Section from "../../components/ui/Section";
import Skeleton from "../../components/common/Skeleton";
import Reveal from "../../components/ui/Reveal";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";
import { AchievementsAPI } from "../../services/achievements.service";
import {
  ACHIEVEMENTS_PAGE_SIZE,
  buildAchievementItems,
  normalizeImageUrl,
} from "../../utils/achievements";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LightboxPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function Achievements() {
  const { isDark } = useDarkMode();
  const [page, setPage] = useState(1);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (!viewer) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [viewer]);

  const q = useQuery({
    queryKey: ["achievements-list"],
    queryFn: async () => await AchievementsAPI.list(),
  });

  const items = useMemo(() => buildAchievementItems(q.data || []), [q.data]);

  const totalPages = Math.max(1, Math.ceil(items.length / ACHIEVEMENTS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ACHIEVEMENTS_PAGE_SIZE;
    return items.slice(start, start + ACHIEVEMENTS_PAGE_SIZE);
  }, [items, currentPage]);

  return (
    <>
      <PageHead
        title="Achievements"
        description="International taekwondo coaching and officiating achievements."
        path="/achievements"
      />

      <div className={cx("transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
        <Section
          title="Achievements"
          topPaddingClass="pt-20 md:pt-24"
          subtitle="International Achievements"
          right={
            <span className={cx("text-sm font-semibold", isDark ? "text-white/60" : "text-black/60")}>
              {items.length} total
            </span>
          }
        >
          {q.isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, idx) => (
                <Skeleton key={idx} className="h-[350px] rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
                {pageItems.map((item, idx) => {
                  const image = normalizeImageUrl(item.imageUrl);

                  return (
                    <Reveal key={item.id} delay={idx * 0.04}>
                      <motion.figure
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={cx(
                          "group break-inside-avoid overflow-hidden rounded-2xl border shadow-sm",
                          isDark ? "bg-slate-900 border-white/10" : "bg-white border-black/10"
                        )}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={image}
                            alt={item.title}
                            className={cx(
                              "w-full h-auto object-contain transition duration-500 group-hover:scale-[1.14]",
                              isDark ? "bg-slate-950" : "bg-black/5"
                            )}
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setViewer({ ...item, imageUrl: image })}
                                className="rounded-xl border border-white/60 bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 transition"
                              >
                                View
                              </button>
                              <Link
                                to={`/achievements/${item.slug}`}
                                className="rounded-xl border border-white/60 bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 transition inline-flex"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>

                        <figcaption className="p-4">
                          <h4 className={cx("font-bold text-sm leading-snug", isDark ? "text-white" : "text-black")}>
                            {item.title}
                          </h4>
                          <p className={cx("mt-2 text-xs leading-relaxed", isDark ? "text-white/65" : "text-black/65")}>
                            {(item.summary || item.description || "").slice(0, 120)}
                            {(item.summary || item.description || "").length > 120 ? "..." : ""}
                          </p>
                          {(item.date || item.location || item.level) && (
                            <div className={cx("mt-3 text-[11px] font-semibold", isDark ? "text-white/45" : "text-black/45")}>
                              {item.date ? new Date(item.date).toLocaleDateString() : ""}
                              {item.location ? ` • ${item.location}` : ""}
                              {item.level ? ` • ${item.level}` : ""}
                            </div>
                          )}
                        </figcaption>
                      </motion.figure>
                    </Reveal>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cx(
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-40",
                    isDark ? "border-white/15 text-white hover:bg-white/10" : "border-black/15 text-black hover:bg-black/5"
                  )}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    const active = p === currentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cx(
                          "h-9 w-9 rounded-lg text-sm font-bold border transition",
                          active
                            ? "bg-brand-500 border-brand-500 text-white"
                            : isDark
                            ? "border-white/15 text-white/80 hover:bg-white/10"
                            : "border-black/15 text-black/80 hover:bg-black/5"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cx(
                    "rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-40",
                    isDark ? "border-white/15 text-white hover:bg-white/10" : "border-black/15 text-black hover:bg-black/5"
                  )}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </Section>
      </div>

      <LightboxPortal>
        <AnimatePresence>
          {viewer ? (
            <motion.div
              data-disable-page-swipe="true"
              className="fixed inset-0 z-[3000] bg-black/80 p-4 md:p-6 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewer(null)}
            >
              <motion.div
                className="relative w-[96vw] max-w-[1800px] max-h-[96vh] overflow-y-auto rounded-2xl border border-white/20 bg-black"
                initial={{ y: 12, opacity: 0.9, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 12, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setViewer(null)}
                  className="absolute right-3 top-3 z-20 h-7 w-7 rounded-md border border-white/60 bg-black/50 text-white text-xs font-bold leading-none hover:bg-black/70 transition"
                  aria-label="Close image"
                  title="Close"
                >
                  x
                </button>
                <img src={viewer.imageUrl} alt={viewer.title} className="w-full h-auto object-contain bg-black" />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </LightboxPortal>
    </>
  );
}
