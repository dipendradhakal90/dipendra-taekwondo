import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import Reveal from "../../components/ui/Reveal";
import Button from "../../components/ui/Button";
import Container from "../../components/common/Container";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";

import { AwardsAPI } from "../../services/awards.service";

/* ======================== Helpers ======================== */

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function yearOf(d) {
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt.getFullYear();
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ======================== Component ======================== */

export default function AwardsPage() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["awards-page"],
    queryFn: AwardsAPI.list,
  });

  const items = useMemo(
    () => (q.data || []).sort((a, b) => new Date(b.awardDate) - new Date(a.awardDate)),
    [q.data]
  );

  // Extract issuers and years for filters
  const issuers = useMemo(() => {
    const unique = new Set(items.map((a) => a.issuer).filter(Boolean));
    return Array.from(unique).sort();
  }, [items]);

  const years = useMemo(() => {
    const unique = new Set(items.map((a) => yearOf(a.awardDate)).filter(Boolean));
    return Array.from(unique).sort((a, b) => b - a);
  }, [items]);

  // Filters
  const [issuerFilter, setIssuerFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered items
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return items.filter((award) => {
      const matchIssuer = issuerFilter === "All" || award.issuer === issuerFilter;
      const matchYear = yearFilter === "All" || yearOf(award.awardDate) === Number(yearFilter);
      const matchSearch =
        !q ||
        award.title.toLowerCase().includes(q) ||
        award.description?.toLowerCase().includes(q) ||
        award.issuer?.toLowerCase().includes(q);

      return matchIssuer && matchYear && matchSearch;
    });
  }, [items, issuerFilter, yearFilter, searchQuery]);

  const resetFilters = () => {
    setIssuerFilter("All");
    setYearFilter("All");
    setSearchQuery("");
  };

  return (
    <>
      <PageHead
        title="Awards"
        description="View professional awards, honors, and recognitions received for coaching excellence and taekwondo achievements."
        path="/awards"
      />
      <div className={cx("transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
        {/* ===== HERO ===== */}
        <section className={cx("max-w-6xl mx-auto px-4 pt-28 md:pt-32 pb-10", isDark ? "text-white" : "text-black")}>
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className={cx("inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full", isDark ? "bg-slate-800 border border-white/10" : "bg-black/[0.02] border border-black/10")}>
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                Awards & Recognition
              </div>

              <h1 className="mt-4 text-2xl md:text-3xl font-extrabold leading-tight">
                Awards & <span className="text-brand-500">Recognition</span>
              </h1>

              <p className={cx("mt-4 text-base md:text-lg max-w-3xl", isDark ? "text-white/60" : "text-black/60")}>
                Major achievements, honors, and official recognitions received throughout my
                career in officiating. Each award represents dedication to excellence and
                commitment to the sport.
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <Link to="/achievements">
                  <Button className="bg-brand-500">Achievements</Button>
                </Link>
                <Link to="/gallery">
                  <Button isDark={isDark}>Gallery</Button>
                </Link>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* ===== FILTERS ===== */}
        <Section
          title="All Awards"
          subtitle={`${filtered.length} awards found`}
          isDark={isDark}
        >
          <Card className={cx("p-6 rounded-[32px]", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-black/10")}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search title, issuer, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cx("w-full rounded-2xl px-4 py-3 outline-none focus:ring-2 border", isDark ? "bg-slate-700/50 border-slate-600 focus:ring-slate-500 text-white" : "border-black/10 focus:ring-black/10")}
                />
              </div>

              {/* Issuer Filter */}
              <select
                value={issuerFilter}
                onChange={(e) => setIssuerFilter(e.target.value)}
                className={cx("rounded-2xl px-4 py-3 outline-none focus:ring-2 border", isDark ? "bg-slate-700/50 border-slate-600 focus:ring-slate-500 text-white" : "border-black/10 focus:ring-black/10")}
              >
                <option className={isDark ? "bg-slate-800" : "bg-white"}>All Issuers</option>
                {issuers.map((issuer) => (
                  <option key={issuer} value={issuer} className={isDark ? "bg-slate-800" : "bg-white"}>
                    {issuer}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={cx("rounded-2xl px-4 py-3 outline-none focus:ring-2 border", isDark ? "bg-slate-700/50 border-slate-600 focus:ring-slate-500 text-white" : "border-black/10 focus:ring-black/10")}
              >
                <option className={isDark ? "bg-slate-800" : "bg-white"}>All Years</option>
                {years.map((year) => (
                  <option key={year} value={year} className={isDark ? "bg-slate-800" : "bg-white"}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Reset Button */}
              {(issuerFilter !== "All" || yearFilter !== "All" || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className={cx("rounded-2xl px-4 py-2 text-sm font-semibold transition border", isDark ? "border-slate-600 hover:bg-slate-700" : "border-black/10 hover:bg-black/5")}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </Card>

          {/* ===== GRID ===== */}
          {q.isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className={cx("p-8 text-center mt-6", isDark ? "text-white/60" : "text-black/60")}>
              <div className="text-2xl mb-2">🏆</div>
              <p>No awards found matching your filters.</p>
              <button
                onClick={resetFilters}
                className="mt-4 text-sm font-semibold text-brand-500 hover:underline"
              >
                Clear filters
              </button>
            </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filtered.map((award, i) => (
              <Reveal key={award._id} delay={i * 0.03}>
                <motion.div whileHover={{ y: -4 }}>
                  <Card className={cx("p-5 hover:shadow-soft transition h-full flex flex-col", isDark ? "bg-slate-800" : "")}>
                    {award.imageUrl && (
                      <div className={cx("mb-4 -m-5 mb-4 rounded-t-3xl overflow-hidden", isDark ? "bg-slate-700" : "bg-black/5")}>
                        <img
                          src={award.imageUrl}
                          alt={award.title}
                          className="block w-full h-auto object-contain"
                        />
                      </div>
                    )}

                    <div className={cx("text-xs font-semibold", isDark ? "text-white/50" : "text-black/50")}>
                      {formatDate(award.awardDate)}
                    </div>

                    <div className="mt-2 font-bold text-lg leading-snug flex-1">
                      {award.title}
                      <span className="text-brand-500">.</span>
                    </div>

                    {award.issuer && (
                      <div className={cx("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>
                        Awarded by: <span className="font-semibold">{award.issuer}</span>
                      </div>
                    )}

                    {award.description && (
                      <p className={cx("text-sm mt-3 line-clamp-3", isDark ? "text-white/70" : "text-black/70")}>
                        {award.description}
                      </p>
                    )}

                    {award.isFeatured && (
                      <div className={cx("mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg w-fit", isDark ? "bg-yellow-400/10 text-yellow-400" : "bg-yellow-50 text-yellow-600")}>
                        ⭐ Featured Award
                      </div>
                    )}
                  </Card>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
