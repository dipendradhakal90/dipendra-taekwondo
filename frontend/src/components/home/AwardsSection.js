import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Section from "../ui/Section";
import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";
import Reveal from "../ui/Reveal";
import { AwardsAPI } from "../../services/awards.service";
import { useDarkMode } from "../../context/DarkModeContext";
import Lightbox from "../gallery/Lightbox";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LightboxPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AwardsSection() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["home-awards"],
    queryFn: async () => {
      const all = await AwardsAPI.list();
      return all.sort((a, b) => new Date(b.awardDate).getTime() - new Date(a.awardDate).getTime()).slice(0, 6);
    },
  });

  const awards = useMemo(() => q.data || [], [q.data]);
  const awardImages = useMemo(
    () =>
      awards
        .filter((a) => !!a?.imageUrl)
        .map((a) => ({
          _id: a._id,
          imageUrl: a.imageUrl,
          title: a.title || "Award",
        })),
    [awards]
  );

  const awardImageIndex = useMemo(() => {
    const map = new Map();
    awardImages.forEach((a, idx) => {
      if (a?._id) map.set(a._id, idx);
      if (a?.imageUrl) map.set(a.imageUrl, idx);
    });
    return map;
  }, [awardImages]);

  const [lbOpen, setLbOpen] = useState(false);
  const [lbStart, setLbStart] = useState(0);

  if (q.isLoading) {
    return (
      <Section title="Awards & Recognition" subtitle="Major achievements and honors.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </Section>
    );
  }

  if (!awards.length) {
    return null;
  }

  return (
    <>
      <Section title="Awards & Recognition" subtitle="Major achievements and honors received." right={null}>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
          {awards.map((award, i) => (
            <div key={award._id} className="break-inside-avoid">
              <Reveal delay={i * 0.05}>
                <motion.div whileHover={{ y: -2 }}>
                  <button
                    type="button"
                    className={cx(
                      "w-full text-left rounded-3xl outline-none",
                      award.imageUrl
                        ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                        : "cursor-default"
                    )}
                    onClick={() => {
                      if (!award.imageUrl) return;
                      const idx = awardImageIndex.get(award._id) ?? awardImageIndex.get(award.imageUrl) ?? 0;
                      setLbStart(idx);
                      setLbOpen(true);
                    }}
                    title={award.imageUrl ? "Open award" : undefined}
                    aria-label={award.imageUrl ? `Open award: ${award.title || "Award"}` : undefined}
                  >
                    <Card className={cx("p-0 hover:shadow-soft transition h-full flex flex-col border overflow-hidden", isDark ? "bg-slate-800 border-white/10" : "bg-white border-black/10")}>
                      {award.imageUrl && (
                        <div className={cx("overflow-hidden", isDark ? "bg-white/5" : "bg-black/5")}>
                          <img src={award.imageUrl} alt={award.title} className="w-full h-auto object-cover" loading="lazy" />
                        </div>
                      )}

                      <div className={cx("p-2.5", isDark ? "bg-slate-800" : "bg-white")}>
                        <div className={cx("text-[11px] font-semibold truncate", isDark ? "text-white/50" : "text-black/50")}>{formatDate(award.awardDate)}</div>
                        <div className={cx("mt-0.5 font-bold text-base leading-tight truncate", isDark ? "text-white" : "text-black")}>{award.title}</div>
                      </div>
                    </Card>
                  </button>
                </motion.div>
              </Reveal>
            </div>
          ))}
        </div>
      </Section>

      {lbOpen && awardImages.length ? (
        <LightboxPortal>
          <Lightbox items={awardImages} startIndex={lbStart} onClose={() => setLbOpen(false)} />
        </LightboxPortal>
      ) : null}
    </>
  );
}
