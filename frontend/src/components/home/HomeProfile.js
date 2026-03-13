import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Globe, Users, CheckCircle } from "lucide-react";

import Skeleton from "../common/Skeleton";
import { AboutAPI } from "../../services/about.service";
import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function HomeProfile() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["home-about"],
    queryFn: AboutAPI.getPublic,
  });

  const d = useMemo(() => q.data || null, [q.data]);

  // ✅ CMS-driven fields (safe fallbacks)
  const name =
    d?.name ||
    d?.fullName ||
    d?.refereeName ||
    d?.heading ||
    "Taekwondo Referee";

  const roleLabel =
    d?.roleLabel ||
    d?.role ||
    "TAEKWONDO REFEREE";

  const designation =
    d?.designation ||
    d?.subheading ||
    "International Referee • Judge • Official";

  const bio = d?.bio || "";

  // ✅ Use stats from CMS (first 4). Fallback if empty.
  const stats =
    Array.isArray(d?.stats) && d.stats.length
      ? d.stats
          .filter((s) => (s?.label || "").trim() && (s?.value || "").trim())
          .slice(0, 4)
          .map((s) => ({
            label: (s.label || "").trim(),
            value: (s.value || "").trim(),
          }))
      : [
          { label: "Years Active", value: "5+" },
          { label: "Championships", value: "25+" },
          { label: "Matches Officiated", value: "300+" },
          { label: "Certifications", value: "10+" },
        ];

  // ✅ Use imageUrl from CMS
  const imageUrl =
    d?.imageUrl ||
    d?.profileImage ||
    d?.photoUrl ||
    d?.avatarUrl ||
    "";

  // ✅ CTA from CMS (matches AdminAbout fields)
  const ctaPrimaryText = d?.ctaPrimaryText || "Contact";
  const ctaPrimaryLink = d?.ctaPrimaryLink || "/contact";
  const ctaSecondaryText = d?.ctaSecondaryText || "View Certifications";
  const ctaSecondaryLink = d?.ctaSecondaryLink || "/certifications";

  // ✅ Highlights from CMS (fallback if empty)
  const highlights =
    Array.isArray(d?.highlights) && d.highlights.length
      ? d.highlights.filter(Boolean).slice(0, 3)
      : [
          "Officiated multiple championships with high professionalism and rule accuracy.",
          "Maintains discipline, fairness, and match flow under pressure.",
          "Continuously updates skills via seminars, camps, and official training programs.",
        ];

  // ✅ Don't show if unpublished
  if (!q.isLoading && d?.isPublished === false) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      {q.isLoading ? (
        <div className="grid md:grid-cols-[380px_1fr] gap-6 items-stretch">
          <Skeleton className="h-[420px] rounded-3xl" />
          <Skeleton className="h-[420px] rounded-3xl" />
        </div>
      ) : (
        <div className="grid md:grid-cols-[380px_1fr] gap-6 items-stretch">
          {/* Left: Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className={isDark ? "rounded-3xl border border-white/10 bg-slate-800 shadow-sm p-6" : "rounded-3xl border border-black/10 bg-white shadow-sm p-6"}
          >
            <div className="flex items-center gap-4">
              <div className={isDark ? "h-20 w-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center" : "h-20 w-20 rounded-2xl bg-black/5 border border-black/10 overflow-hidden flex items-center justify-center"}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className={isDark ? "text-xl font-extrabold text-white/60" : "text-xl font-extrabold text-black/60"}>
                    {(name || "R").slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className={isDark ? "text-xs font-semibold text-white/50 uppercase" : "text-xs font-semibold text-black/50 uppercase"}>
                  {roleLabel}
                </div>
                <div className={isDark ? "text-xl font-extrabold leading-tight truncate text-white" : "text-xl font-extrabold leading-tight truncate text-black"}>
                  {name}
                  <span className="text-brand-500">.</span>
                </div>
                <div className={isDark ? "text-sm text-white/60 mt-1 truncate" : "text-sm text-black/60 mt-1 truncate"}>
                  {designation}
                </div>
              </div>
            </div>

            <div className={isDark ? "mt-5 text-sm text-white/70 leading-relaxed whitespace-pre-line" : "mt-5 text-sm text-black/70 leading-relaxed whitespace-pre-line"}>
              {bio || "Add your About bio from Admin → About."}
            </div>

            {/* Small chips (optional, lightweight, no CMS dependency) */}
            <div className="mt-5 flex gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle size={13} className="text-green-600" />
                Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Globe size={13} className="text-blue-600" />
                International
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Award size={13} className="text-purple-600" />
                Certified
              </span>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap">
              <a
                href={ctaPrimaryLink}
                className={isDark ? "inline-flex items-center justify-center rounded-2xl px-4 py-3 bg-white text-black font-semibold text-sm hover:opacity-90" : "inline-flex items-center justify-center rounded-2xl px-4 py-3 bg-black text-white font-semibold text-sm hover:opacity-90"}
              >
                {ctaPrimaryText}
              </a>
              <a
                href={ctaSecondaryLink}
                className={isDark ? "inline-flex items-center justify-center rounded-2xl px-4 py-3 bg-slate-700 text-white border border-white/10 text-sm font-semibold" : "inline-flex items-center justify-center rounded-2xl px-4 py-3 bg-white border border-black/10 text-black font-semibold text-sm hover:bg-black/5"}
              >
                {ctaSecondaryText} →
              </a>
            </div>
          </motion.div>

          {/* Right: Stats + Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className={isDark ? "rounded-3xl border border-white/10 bg-slate-800 shadow-sm p-6" : "rounded-3xl border border-black/10 bg-white shadow-sm p-6"}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-2xl font-extrabold flex items-center gap-2">
                  <Users size={24} className="text-brand-500" />
                  Profile Highlights<span className="text-brand-500">.</span>
                </div>
                <div className={isDark ? "text-sm text-white/60 mt-1" : "text-sm text-black/60 mt-1"}>
                  Professional achievements & recognition
                </div>
              </div>

              <a
                href="/about"
                className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition"
              >
                View full profile →
              </a>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {stats.map((s, idx) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cx("rounded-2xl border bg-gradient-to-br from-brand-500/5 to-transparent p-4 hover:border-brand-500/30 transition", isDark ? "border-white/10" : "border-black/10")}
                >
                  <div className="text-2xl font-extrabold text-brand-600">
                    {s.value}
                  </div>
                  <div className={isDark ? "text-xs font-semibold text-white/60 mt-1" : "text-xs font-semibold text-black/60 mt-1"}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={cx("mt-6 rounded-2xl border bg-gradient-to-br p-5", isDark ? "border-white/10 from-slate-800/30 to-transparent" : "border-black/10 from-amber-50 to-transparent")}>
              <div className="flex items-center gap-2 text-sm font-bold mb-3">
                <Award size={18} className="text-amber-600" />
                Key Highlights
              </div>
              <ul className={cx("text-sm leading-relaxed space-y-2", isDark ? "text-white/70" : "text-black/70")}>
                {highlights.map((h, idx) => (
                  <motion.li
                    key={`${h}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-2"
                  >
                    <span className="text-amber-600 font-bold mt-0.5">●</span>
                    <span>{h}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
