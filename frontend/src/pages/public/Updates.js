// frontend/src/pages/public/Updates.js
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import Reveal from "../../components/ui/Reveal";
import PageHead from "../../components/common/PageHead";

import { PostsAPI } from "../../services/posts.service";
import { useDarkMode } from "../../context/DarkModeContext";

/* ----------------------------- Helpers ----------------------------- */

function safeText(v) {
  return (v ?? "").toString().trim();
}

function formatDate(d) {
  try {
    return d ? new Date(d).toDateString() : "";
  } catch {
    return "";
  }
}

function getPostDate(p) {
  return p?.publishedAt || p?.createdAt || p?.updatedAt || p?.date || "";
}

function getPostCover(p) {
  return (
    p?.coverImageUrl ||
    p?.coverImage ||
    p?.imageUrl ||
    p?.thumbnailUrl ||
    p?.bannerUrl ||
    p?.image ||
    ""
  );
}

function getPostCategory(p) {
  if (typeof p?.category === "string" && p.category.trim()) return p.category.trim();
  if (typeof p?.type === "string" && p.type.trim()) return p.type.trim();
  if (Array.isArray(p?.tags) && p.tags.length) return String(p.tags[0] || "").trim();
  return "";
}

function getExcerpt(p) {
  const raw =
    p?.excerpt ||
    p?.summary ||
    p?.description ||
    (safeText(p?.content).slice(0, 160) ? safeText(p?.content).slice(0, 160) + "…" : "");
  return safeText(raw);
}

function estimateReadingTime(text) {
  const t = safeText(text);
  if (!t) return 1;
  const words = t.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/* ----------------------------- UI bits ----------------------------- */

function Chip({ children, active = false, onClick }) {
  const { isDark } = useDarkMode();

  const clsBase = "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition ";
  const cls =
    clsBase +
    (active
      ? isDark
        ? "bg-white text-black border-white"
        : "bg-black text-white border-black"
      : isDark
      ? "bg-transparent text-white/70 border-white/10 hover:bg-white/5"
      : "bg-white text-black/70 border-black/10 hover:bg-black/5");

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export default function Updates() {
  const { isDark } = useDarkMode();
  const postsQ = useQuery({
    queryKey: ["updates-page"],
    queryFn: async () => await PostsAPI.listPublished(), // ✅ CMS driven
  });

  const posts = useMemo(() => (Array.isArray(postsQ.data) ? postsQ.data : []), [postsQ.data]);

  // categories
  const categories = useMemo(() => {
    const cats = posts.map(getPostCategory).filter(Boolean);
    const uniq = Array.from(new Set(cats));
    return ["All", ...uniq];
  }, [posts]);

  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [visible, setVisible] = useState(9);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return posts
      .slice()
      .sort((a, b) => new Date(getPostDate(b) || 0) - new Date(getPostDate(a) || 0))
      .filter((p) => {
        const c = getPostCategory(p);
        if (cat !== "All" && c !== cat) return false;

        if (!query) return true;

        const hay = [
          safeText(p?.title),
          safeText(p?.excerpt),
          safeText(p?.summary),
          safeText(p?.description),
          safeText(p?.content),
          safeText(c),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(query);
      });
  }, [posts, cat, q]);

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);

  return (
    <>
      <PageHead
        title="Updates"
        description="Stay updated with latest posts, announcements, and news from the taekwondo coaching and refereeing community."
        path="/updates"
      />
      <Section
        title="Latest Posts"
        topPaddingClass="pt-20 md:pt-24"
        subtitle="Announcements, posts, and activity updates — searchable and filterable."
        right={
          <span className={isDark ? "text-sm font-semibold text-white/60" : "text-sm font-semibold text-black/60"}>
            {postsQ.isLoading ? "Loading…" : `${filtered.length} posts`}
          </span>
        }
      >
      {/* Filter bar */}
      <Card className={isDark ? "p-5 rounded-3xl border border-white/10 bg-slate-700/30 backdrop-blur shadow-sm" : "p-5 rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm"}>
        <div className="grid lg:grid-cols-[1fr_auto] gap-3 items-center">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setVisible(9);
              }}
              placeholder="Search updates (title, content, category)…"
              className={isDark ? "w-full rounded-3xl border border-white/10 bg-slate-700/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/10" : "w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"}
            />
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setVisible(9);
                }}
                className={isDark ? "absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 text-xs font-bold bg-white/5 hover:bg-white/10" : "absolute right-3 top-1/2 -translate-y-1/2 rounded-2xl px-3 py-2 text-xs font-bold bg-black/5 hover:bg-black/10"}
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            {(cat !== "All" || q.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setCat("All");
                  setQ("");
                  setVisible(9);
                }}
                className={isDark ? "rounded-2xl border border-white/10 bg-slate-700/30 px-4 py-3 text-sm font-semibold text-white/70 hover:bg-slate-700/40 transition" : "rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/5 transition"}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((c) => (
            <Chip
              key={c}
              active={c === cat}
              onClick={() => {
                setCat(c);
                setVisible(9);
              }}
            >
              {c}
            </Chip>
          ))}
        </div>
      </Card>

      {/* Grid */}
      <div className="mt-6">
        {postsQ.isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-3xl border border-black/10">
                <Skeleton className="h-52 w-full" />
                <div className="p-5 grid gap-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : shown.length ? (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {shown.map((p, i) => {
                const cover = getPostCover(p);
                const category = getPostCategory(p);
                const dt = getPostDate(p);
                const readMin = estimateReadingTime(p?.content || p?.excerpt || p?.summary);

                return (
                  <div key={p._id || p.slug || i} className="break-inside-avoid">
                    <Reveal delay={i * 0.03}>
                      <Link
                        to={`/updates/${p.slug}`}
                        className="group block focus:outline-none focus:ring-2 focus:ring-black/15 rounded-3xl"
                      >
                        <Card className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-soft transition">
                          {/* ✅ IMAGE */}
                          <div className="relative overflow-hidden bg-black/[0.03]">
                            {cover ? (
                              <>
                                <img
                                  src={cover}
                                  alt={p.title || "Post"}
                                  className="w-full h-auto object-cover transition duration-500 group-hover:scale-[1.08]"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
                              </>
                            ) : (
                              <div className="min-h-[180px] w-full flex items-center justify-center text-black/40 font-semibold">
                                No Image
                              </div>
                            )}

                            {/* Badges */}
                            <div className="absolute left-3 top-3 flex items-center gap-2">
                              {category ? (
                                <span
                                  className={
                                    "text-[11px] font-bold px-3 py-1 rounded-full border px-3 py-1 " +
                                    (isDark
                                      ? "bg-white/10 text-white border-white/10"
                                      : "bg-white/90 text-black border-black/10")
                                  }
                                >
                                  {category}
                                </span>
                              ) : null}

                              <span className={isDark ? "text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/10 text-white border border-white/10" : "text-[11px] font-extrabold px-3 py-1 rounded-full bg-black/5 text-black border border-black/10"}>
                                {readMin} min
                              </span>
                            </div>
                          </div>

                          {/* ✅ TEXT */}
                          <div className="p-3">
                            <div className={"text-xs font-semibold truncate " + (isDark ? "text-white/55" : "text-black/55")}>{dt ? formatDate(dt) : "Update"}</div>

                            <div className={"mt-1 text-lg md:text-xl font-extrabold leading-tight truncate group-hover:underline underline-offset-4 " + (isDark ? "text-white" : "text-black")}>
                              {p.title || "Untitled"}
                            </div>

                            <div className={"mt-1 text-sm line-clamp-1 " + (isDark ? "text-white/65" : "text-black/65")}>
                              {getExcerpt(p) || "Open to read the full update."}
                            </div>

                            <div className={"mt-2 text-xs font-semibold " + (isDark ? "text-white/60" : "text-black/45")}>Tap to read →</div>
                          </div>
                        </Card>
                      </Link>
                    </Reveal>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {visible < filtered.length ? (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 9)}
                  className={isDark ? "rounded-2xl border border-white/10 bg-slate-700/30 px-6 py-3 text-sm font-semibold text-white/70 hover:bg-slate-700/40 transition" : "rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black/70 hover:bg-black/5 transition"}
                >
                  Load more
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <Card className={"p-6 mt-6 " + (isDark ? "text-white/60" : "text-black/60")}>
            No posts found. Try changing category or clearing search.
          </Card>
        )}
      </div>
    </Section>
    </>
  );
}
