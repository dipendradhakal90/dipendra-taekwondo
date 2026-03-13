// frontend/src/components/home/HomeTimeline.js

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Section from "../ui/Section";
import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";
import Reveal from "../ui/Reveal";

import { AchievementsAPI } from "../../services/achievements.service";

/* ----------------------------- helpers ----------------------------- */

function safeDate(d) {
  if (!d) return null;
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? null : x;
}

function fmtMonthYear(d) {
  if (!d) return "";
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

function buildTimeline(achievements = []) {
  const list = Array.isArray(achievements) ? achievements : [];

  // newest first
  const sorted = [...list].sort((a, b) => {
    const da = safeDate(a?.date)?.getTime() || 0;
    const db = safeDate(b?.date)?.getTime() || 0;
    return db - da;
  });

  // map to timeline items (limit for homepage)
  return sorted.slice(0, 14).map((e) => {
    const dt = safeDate(e?.date);
    const title = e?.title || "Achievement";
    const level = e?.level || "";
    const role = e?.role || "";
    const location = e?.location || "";
    const subtitle = [level, role, location].filter(Boolean).join(" • ");

    return {
      id: e?._id || `${title}-${dt ? dt.toISOString() : Math.random()}`,
      year: dt ? String(dt.getFullYear()) : "—",
      when: dt ? fmtMonthYear(dt) : "",
      dateText: dt ? dt.toDateString() : "",
      title,
      subtitle,
      description: e?.description || "",
      badge: level || "Verified",
    };
  });
}

function groupByYear(items = []) {
  const groups = new Map();
  for (const it of items) {
    const y = it.year || "—";
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y).push(it);
  }

  // years desc, keep "—" last
  const years = Array.from(groups.keys()).sort((a, b) => {
    if (a === "—") return 1;
    if (b === "—") return -1;
    return Number(b) - Number(a);
  });

  return years.map((y) => ({ year: y, items: groups.get(y) || [] }));
}

/* ----------------------------- UI blocks ----------------------------- */

function TimelineYearBlock({ year, items }) {
  return (
    <div className="grid lg:grid-cols-[140px_1fr] gap-5">
      {/* Year label */}
      <div className="sticky top-28 self-start">
        <div className="text-sm font-extrabold text-black/70">{year}</div>
        <div className="text-xs text-black/40 mt-1">{items.length} milestones</div>
      </div>

      {/* Timeline column */}
      <div className="relative">
        {/* vertical line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-black/10" />

        <div className="grid gap-3">
          {items.map((t, idx) => (
            <Reveal key={t.id} delay={idx * 0.03}>
              <div className="relative pl-10">
                {/* dot */}
                <div className="absolute left-0 top-6">
                  <div className="h-6 w-6 rounded-full bg-white border border-black/15 shadow-sm grid place-items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-black/70" />
                  </div>
                </div>

                {/* card */}
                <Card className="p-5 rounded-2xl border border-black/10 hover:shadow-soft transition bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-black/50">
                        {t.when || t.dateText || "Milestone"}
                      </div>

                      <div className="mt-1 font-extrabold text-[15px] leading-snug">
                        {t.title}
                        <span className="text-brand-500">.</span>
                      </div>

                      {t.subtitle ? <div className="text-sm text-black/60 mt-1">{t.subtitle}</div> : null}

                      {t.description ? (
                        <div className="text-sm text-black/70 mt-3 whitespace-pre-line leading-relaxed line-clamp-4">
                          {t.description}
                        </div>
                      ) : null}
                    </div>

                    <span className="shrink-0 hidden sm:inline-flex rounded-full px-3 py-2 text-xs font-semibold bg-black/5 border border-black/10">
                      {t.badge}
                    </span>
                  </div>
                </Card>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- component ----------------------------- */

export default function HomeTimeline() {
  const q = useQuery({
    queryKey: ["home-timeline-achievements"],
    queryFn: async () => await AchievementsAPI.list(),
  });

  const timelineItems = useMemo(() => buildTimeline(q.data || []), [q.data]);
  const grouped = useMemo(() => groupByYear(timelineItems), [timelineItems]);

  return (
    <Section
      title="Journey Timeline"
      subtitle="Verified milestones from achievements (auto-updated from CMS)."
      right={
        <Link className="text-sm font-semibold text-black/60 hover:text-black transition" to="/achievements">
          View all →
        </Link>
      }
    >
      {q.isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : grouped.length ? (
        <div className="grid gap-10">
          {grouped.map((g, idx) => (
            <TimelineYearBlock key={`${g.year}-${idx}`} year={g.year} items={g.items} />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-black/60">
          No achievements found yet. Add entries from <b>Admin -> Achievements</b> and this timeline will update automatically.
        </Card>
      )}
    </Section>
  );
}


