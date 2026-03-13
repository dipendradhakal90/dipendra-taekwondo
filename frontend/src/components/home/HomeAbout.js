import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import Card from "../ui/Card";
import Section from "../ui/Section";
import Skeleton from "../common/Skeleton";
import { useDarkMode } from "../../context/DarkModeContext";
import { AboutAPI } from "../../services/about.service";
import AboutMeCard from "../about/AboutMeCard";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function HomeAbout() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["home-about"],
    queryFn: AboutAPI.getPublic,
  });

  const d = q.data;

  const highlights = useMemo(
    () => (Array.isArray(d?.highlights) ? d.highlights.filter(Boolean) : []),
    [d]
  );

  const stats = useMemo(
    () => (Array.isArray(d?.stats) ? d.stats.filter((s) => s?.label && s?.value) : []),
    [d]
  );

  return (
    <Section
      title="About Me"
      subtitle={d?.subheading || "Professional profile & officiating journey."}
      right={
        <a
          href="/about"
          className={cx("text-sm font-semibold transition", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}
        >
          Read more →
        </a>
      }
    >
      {q.isLoading ? (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          <Skeleton className="h-[420px] lg:h-[460px] xl:h-[520px] rounded-3xl" />
          <Skeleton className="h-[420px] lg:h-[460px] xl:h-[520px] rounded-3xl" />
        </div>
      ) : d?.isPublished === false ? (
        <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>About is not published yet.</Card>
      ) : (
        <div className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">

          {/* ================= LEFT: IMAGE ONLY (clean) ================= */}
          <Card className={cx("p-0 overflow-hidden self-start", isDark ? "bg-slate-800/30" : "bg-black/[0.02]")}>
            {d?.imageUrl ? (
              <img
                src={d.imageUrl}
                alt="Profile"
                className="
                  w-full
                  h-auto
                  object-contain
                  transition
                  duration-300
                "
                loading="lazy"
              />
            ) : (
              <div className={cx("min-h-[260px] flex items-center justify-center", isDark ? "text-white/40" : "text-black/40")}>
                No Image
              </div>
            )}
          </Card>

          {/* ================= RIGHT: ABOUT ME + PROFESSIONAL PROFILE ================= */}
          <div className="grid gap-4">
            <AboutMeCard
              isDark={isDark}
              bio={d?.bio || ""}
              showHeader={false}
              maxHeightClass="max-h-[420px]"
            />

            <Card className={cx("p-4 mt-2", isDark ? "bg-slate-800/90 border-white/10" : "bg-white/90 border-black/10")}>
              <div className={cx("text-lg md:text-xl font-extrabold tracking-tight", isDark ? "text-white" : "text-black")}>
                Professional Profile<span className="text-brand-500">.</span>
              </div>

              {highlights.length ? (
                <div className="mt-4">
                  <div className={cx("text-sm font-semibold", isDark ? "text-white" : "text-black")}>Highlights</div>
                  <ul className={cx("mt-3 text-sm list-disc pl-5 space-y-2", isDark ? "text-white/70" : "text-black/70")}>
                    {highlights.slice(0, 6).map((h, i) => (
                      <li key={h + i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {stats.length ? (
                <div className="mt-5 grid sm:grid-cols-2 gap-3">
                  {stats.slice(0, 4).map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className={cx("rounded-2xl border px-4 py-3", isDark ? "border-white/10 bg-slate-800/30" : "border-black/10 bg-black/[0.02]")}
                    >
                      <div className={cx("text-base md:text-lg font-extrabold", isDark ? "text-white" : "text-black")}>{s.value}</div>
                      <div className={cx("text-xs", isDark ? "text-white/60" : "text-black/60")}>{s.label}</div>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      )}
    </Section>
  );
}
