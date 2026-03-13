import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Reveal from "../../components/ui/Reveal";
import Skeleton from "../../components/common/Skeleton";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";
import Lightbox from "../../components/gallery/Lightbox";

import { CertificationsAPI } from "../../services/certifications.service";
import { AwardsAPI } from "../../services/awards.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ================= Helpers ================= */

function safeDate(d) {
  const x = d ? new Date(d) : null;
  return x && !isNaN(x.getTime()) ? x : null;
}

function formatDate(d) {
  const x = safeDate(d);
  return x ? x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
}

function looksLikeImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  const lowered = value.toLowerCase();
  const raw = lowered.split("?")[0].split("#")[0];
  if (/\.(jpg|jpeg|png|webp|gif|bmp|svg|avif)$/.test(raw)) return true;
  if (raw.includes("/image/upload/")) return true;
  if (lowered.includes("drive.google.com/thumbnail")) return true;
  if (lowered.includes("drive.google.com/uc?")) return true;
  if (lowered.includes("googleusercontent.com")) return true;
  return false;
}

function getCertificationImageUrl(certification) {
  if (certification?.imageUrl) return certification.imageUrl;
  if (certification?.certificateImageUrl) return certification.certificateImageUrl;
  if (looksLikeImageUrl(certification?.credentialUrl)) return certification.credentialUrl;
  return "";
}

function LightboxPortal({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* ================= Page ================= */

export default function Certifications() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["certifications-page"],
    queryFn: CertificationsAPI.list, // published list
  });

  const awardsQ = useQuery({
    queryKey: ["awards-page"],
    queryFn: AwardsAPI.list,
  });

  const items = useMemo(() => q.data || [], [q.data]);
  const sortedItems = useMemo(
    () =>
      (items || [])
        .slice()
        .sort((a, b) => (safeDate(b.issueDate)?.getTime() || 0) - (safeDate(a.issueDate)?.getTime() || 0)),
    [items]
  );

  const certImages = useMemo(
    () =>
      sortedItems
        .map((c) => {
          const imageUrl = getCertificationImageUrl(c);
          if (!imageUrl) return null;
          return {
            _id: c._id,
            imageUrl,
            title: c.title || "Certification",
          };
        })
        .filter(Boolean),
    [sortedItems]
  );

  const certImageIndex = useMemo(() => {
    const map = new Map();
    certImages.forEach((c, idx) => {
      if (c?._id) map.set(c._id, idx);
      if (c?.imageUrl) map.set(c.imageUrl, idx);
    });
    return map;
  }, [certImages]);

  const awardImages = useMemo(
    () =>
      (awardsQ.data || [])
        .filter((a) => !!a?.imageUrl)
        .map((a) => ({
          _id: a._id,
          imageUrl: a.imageUrl,
          title: a.title || "Award",
        })),
    [awardsQ.data]
  );

  const awardImageIndex = useMemo(() => {
    const map = new Map();
    awardImages.forEach((a, idx) => {
      if (a?._id) map.set(a._id, idx);
      if (a?.imageUrl) map.set(a.imageUrl, idx);
    });
    return map;
  }, [awardImages]);

  const [awardLbOpen, setAwardLbOpen] = useState(false);
  const [awardLbStart, setAwardLbStart] = useState(0);
  const [certLbOpen, setCertLbOpen] = useState(false);
  const [certLbStart, setCertLbStart] = useState(0);

  return (
    <>
      <PageHead
        title="Certifications"
        description="Explore professional certifications, training credentials, and recognized qualifications in taekwondo coaching and refereeing."
        path="/certifications"
      />
      <div className={cx("transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
      {/* ===== Grid ===== */}
      <Section
        title="Certifications"
        topPaddingClass="pt-20 md:pt-24"
        subtitle="Premium card layout with clean details and direct credential access."
        right={
          <span className={cx("text-sm font-semibold", isDark ? "text-white/60" : "text-black/60")}>
            {q.isLoading ? "" : `${items.length} total`}
          </span>
        }
      >
        {q.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : sortedItems.length ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
            <AnimatePresence>
              {sortedItems.map((c, i) => {
                const certImageUrl = getCertificationImageUrl(c);

                return (
                  <div key={c._id || `${c.title}-${i}`} className="break-inside-avoid">
                    <Reveal delay={i * 0.03}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.25 }}
                      >
                        <button
                          type="button"
                          className={cx(
                            "group w-full text-left rounded-[28px] outline-none",
                            certImageUrl
                              ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                              : "cursor-default"
                          )}
                          onClick={() => {
                            if (!certImageUrl) return;
                            const idx = certImageIndex.get(c._id) ?? certImageIndex.get(certImageUrl) ?? 0;
                            setCertLbStart(idx);
                            setCertLbOpen(true);
                          }}
                          title={certImageUrl ? "Open certification" : undefined}
                          aria-label={certImageUrl ? `Open certification: ${c.title || "Certification"}` : undefined}
                        >
                          <Card className={cx("p-0 rounded-[28px] border hover:shadow-soft transition overflow-hidden", isDark ? "border-white/10 bg-slate-800" : "border-black/10 bg-white")}>
                            <div className="relative">
                              {certImageUrl ? (
                                <img src={certImageUrl} alt={c.title || "Certification"} className="w-full h-auto object-cover transition duration-500 group-hover:scale-[1.08]" loading="lazy" />
                              ) : (
                                <div className={cx("h-44 w-full grid place-items-center text-sm font-semibold", isDark ? "bg-slate-700 text-white/50" : "bg-black/5 text-black/50")}>
                                  No image
                                </div>
                              )}
                            </div>

                            <div className={cx("p-2.5 text-left", isDark ? "bg-slate-800" : "bg-white")}>
                              <div className={cx("text-[11px] font-semibold truncate", isDark ? "text-white/50" : "text-black/50")}>
                                {formatDate(c.issueDate)}
                              </div>
                              <div className={cx("mt-0.5 font-bold text-base leading-tight truncate", isDark ? "text-white" : "text-black")}>
                                {c.title || "Untitled Certification"}
                                <span className="text-brand-500">.</span>
                              </div>
                            </div>
                          </Card>
                        </button>
                      </motion.div>
                    </Reveal>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>
            No certifications yet.
          </Card>
        )}
      </Section>

      {/* ===== Awards (merged) ===== */}
      <Section
        title="Awards & Recognition"
        subtitle="Honors, awards, and featured recognitions"
        right={
          <span className={cx("text-sm font-semibold", isDark ? "text-white/60" : "text-black/60")}>
            {awardsQ.isLoading ? "" : `${(awardsQ.data || []).length} total`}
          </span>
        }
      >
        {awardsQ.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : (awardsQ.data || []).length === 0 ? (
          <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>No awards yet.</Card>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
            {(awardsQ.data || []).map((award, i) => (
              <div key={award._id} className="break-inside-avoid">
                <Reveal delay={i * 0.03}>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <button
                      type="button"
                      className={cx(
                        "group w-full text-left rounded-3xl outline-none",
                        award.imageUrl
                          ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
                          : "cursor-default"
                      )}
                      onClick={() => {
                        if (!award.imageUrl) return;
                        const idx = awardImageIndex.get(award._id) ?? awardImageIndex.get(award.imageUrl) ?? 0;
                        setAwardLbStart(idx);
                        setAwardLbOpen(true);
                      }}
                      title={award.imageUrl ? "Open award" : undefined}
                      aria-label={award.imageUrl ? `Open award: ${award.title || "Award"}` : undefined}
                    >
                      <Card className={cx("p-0 hover:shadow-soft transition h-full flex flex-col border overflow-hidden", isDark ? "bg-slate-800 border-white/10" : "bg-white border-black/10")}>
                        {award.imageUrl && (
                          <div className={cx("overflow-hidden", isDark ? "bg-slate-700" : "bg-black/5")}>
                            <img src={award.imageUrl} alt={award.title} className="w-full h-auto object-cover transition duration-500 group-hover:scale-[1.08]" loading="lazy" />
                          </div>
                        )}

                        <div className={cx("p-2.5", isDark ? "bg-slate-800" : "bg-white")}>
                          <div className={cx("text-[11px] font-semibold truncate", isDark ? "text-white/50" : "text-black/50")}>{formatDate(award.awardDate)}</div>
                          <div className={cx("mt-0.5 font-bold text-base leading-tight truncate", isDark ? "text-white" : "text-black")}>{award.title}<span className="text-brand-500">.</span></div>
                        </div>
                      </Card>
                    </button>
                  </motion.div>
                </Reveal>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>

    <AnimatePresence>
      {certLbOpen && certImages.length ? (
        <LightboxPortal>
          <Lightbox items={certImages} startIndex={certLbStart} onClose={() => setCertLbOpen(false)} />
        </LightboxPortal>
      ) : null}
      {awardLbOpen && awardImages.length ? (
        <LightboxPortal>
          <Lightbox items={awardImages} startIndex={awardLbStart} onClose={() => setAwardLbOpen(false)} />
        </LightboxPortal>
      ) : null}
    </AnimatePresence>
    </>
  );
}
