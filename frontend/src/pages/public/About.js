// frontend/src/pages/public/About.js
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import Reveal from "../../components/ui/Reveal";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";
import AboutMeCard from "../../components/about/AboutMeCard";

import { AboutAPI } from "../../services/about.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ----------------------------- Small UI bits ----------------------------- */

function SoftGlow({ isDark }) {
  return (
    <div className="pointer-events-none absolute -inset-10 opacity-60">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
      <div className={cx("absolute right-0 top-10 h-72 w-72 rounded-full blur-3xl", isDark ? "bg-white/10" : "bg-black/10")} />
      <div className="absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
    </div>
  );
}

// Divider and CTA pill were removed from this page (kept in footer/contact)

/* ----------------------------- Main Page ----------------------------- */

export default function About() {
  const { isDark } = useDarkMode();
  const aboutQ = useQuery({
    queryKey: ["about-public"],
    queryFn: AboutAPI.getPublic,
  });

  const about = useMemo(() => aboutQ.data || {}, [aboutQ.data]);

  // ✅ ONLY use Admin CMS fields (to match admin/About.js)
  const subheading = about?.subheading || "Professional profile & officiating journey.";
  const imageUrl = about?.imageUrl || "";
  const profileStatusTitle = about?.profileStatusTitle || "PROFESSIONAL STATUS";
  const taekwondoTrainingsTitle = about?.taekwondoTrainingsTitle || "TAEKWONDO TRAININGS";

  const highlights = Array.isArray(about?.highlights) ? about.highlights.filter(Boolean) : [];
  const stats = Array.isArray(about?.stats) ? about.stats.filter((s) => s?.label && s?.value) : [];
  const profileStatusItems = Array.isArray(about?.profileStatusItems)
    ? about.profileStatusItems.filter(Boolean)
    : [];
  const taekwondoTrainingsItems = Array.isArray(about?.taekwondoTrainingsItems)
    ? about.taekwondoTrainingsItems.filter(Boolean)
    : [];

  return (
    <>
      <PageHead
        title="About"
        description="Learn about the taekwondo referee's professional background, coaching philosophy, and international achievements."
        path="/about"
      />
      <div className={cx("transition-colors duration-300 min-h-screen", isDark ? "bg-slate-950" : "bg-white")}>
      {/* =================== HERO =================== */}
      <Section title="About Me" subtitle={subheading} topPaddingClass="pt-20 md:pt-24">
        {aboutQ.isLoading ? (
          <div className="grid lg:grid-cols-[440px_1fr] gap-6">
            <Skeleton className="h-[520px] rounded-3xl" />
            <Skeleton className="h-[520px] rounded-3xl" />
          </div>
        ) : about?.isPublished === false ? (
          <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>About is not published yet.</Card>
        ) : (
          <div className="relative">
            <SoftGlow isDark={isDark} />

            <div className="grid lg:grid-cols-[440px_1fr] gap-6 items-stretch relative">
              {/* LEFT */}
              <Reveal>
                <Card className={cx("p-0 rounded-[28px] border shadow-sm overflow-hidden backdrop-blur relative", isDark ? "border-white/10 bg-slate-800/90" : "border-black/10 bg-white/90")}>
                  <div className={cx("relative rounded-[28px] overflow-hidden", isDark ? "bg-slate-700/50" : "bg-black/[0.02]")}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="About profile"
                        className="w-full h-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className={cx("h-[420px] flex items-center justify-center font-bold", isDark ? "text-white/40" : "text-black/40")}>
                        No Image
                      </div>
                    )}

                  </div>
                </Card>
              </Reveal>

              {/* RIGHT */}
              <Reveal delay={0.06}>
                <div className="grid gap-4">
                  <AboutMeCard
                    isDark={isDark}
                    bio={about?.bio || ""}
                    showHeader={false}
                    maxHeightClass="max-h-[460px]"
                  />

                  <Card className={cx("p-4 rounded-[28px] border shadow-sm backdrop-blur relative overflow-hidden", isDark ? "border-white/10 bg-slate-800/90" : "border-black/10 bg-white/90")}>
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/[0.04] to-transparent" />

                    <div className="flex items-end justify-between flex-wrap gap-3 relative">
                      <div>
                        <div className={cx("text-xl md:text-2xl font-extrabold tracking-tight", isDark ? "text-white" : "text-black")}>
                          Professional Profile<span className="text-brand-500">.</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {stats.length ? (
                      <div className="grid sm:grid-cols-2 gap-3 mt-4">
                        {stats.slice(0, 4).map((s, idx) => (
                          <motion.div
                            key={`${s.label}-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.35, delay: idx * 0.03 }}
                            className={cx("rounded-3xl border shadow-sm p-3 relative overflow-hidden", isDark ? "border-white/10 bg-slate-800" : "border-black/10 bg-white")}
                          >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/[0.03] via-transparent to-black/[0.02]" />
                            <div className="relative">
                              <div className="text-lg font-extrabold">{s.value}</div>
                              <div className={cx("text-xs font-semibold mt-1", isDark ? "text-white/55" : "text-black/55")}>{s.label}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={cx("mt-5 rounded-3xl border p-4 text-sm", isDark ? "border-white/10 bg-slate-700/30 text-white/60" : "border-black/10 bg-black/[0.02] text-black/60")}>
                        Add stats from <b>Admin → About</b>.
                      </div>
                    )}

                    {/* Highlights */}
                    {highlights.length ? (
                      <div className={cx("mt-4 rounded-3xl border shadow-sm p-4", isDark ? "border-white/10 bg-slate-800" : "border-black/10 bg-white")}>
                        <ul className="mt-3 grid gap-3">
                          {highlights.slice(0, 6).map((h, idx) => (
                            <li
                              key={`${h}-${idx}`}
                              className={cx("flex gap-3 items-start text-sm leading-relaxed", isDark ? "text-white/70" : "text-black/70")}
                            >
                              <span className={cx("mt-1 h-2.5 w-2.5 rounded-full shrink-0", isDark ? "bg-white/70" : "bg-black/70")} />
                              <span className="whitespace-pre-line">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </Card>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Professional Status & Taekwondo Trainings"
        subtitle="This section is editable from Admin → About."
      >
        <div className="grid lg:grid-cols-2 gap-0 rounded-[24px] overflow-hidden border border-black/10 dark:border-white/10">
          <div className={cx("p-5 md:p-8", isDark ? "bg-blue-900/60 text-white" : "bg-[#124a97] text-white")}>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {profileStatusTitle}
            </h3>
            {profileStatusItems.length ? (
              <ol className="mt-5 space-y-1.5 text-sm md:text-base leading-relaxed list-decimal list-inside">
                {profileStatusItems.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-base text-white/85">
                Add items from Admin About for Professional Status.
              </p>
            )}
          </div>

          <div className={cx("p-5 md:p-8", isDark ? "bg-blue-800/60 text-white" : "bg-[#3f6fb2] text-white")}>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {taekwondoTrainingsTitle}
            </h3>
            {taekwondoTrainingsItems.length ? (
              <ol className="mt-5 space-y-1.5 text-sm md:text-base leading-relaxed list-decimal list-inside">
                {taekwondoTrainingsItems.map((item, idx) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 text-base text-white/85">
                Add items from Admin About for Taekwondo Trainings.
              </p>
            )}
          </div>
        </div>
      </Section>
      </div>
    </>
  );
}
