import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Section from "../ui/Section";
import Card from "../ui/Card";
import Skeleton from "../common/Skeleton";
import Reveal from "../ui/Reveal";

import { PostsAPI } from "../../services/posts.service";
import { AchievementsAPI } from "../../services/achievements.service";
import { CertificationsAPI } from "../../services/certifications.service";
import { GalleryAPI } from "../../services/gallery.service";
import { MediaCoverageAPI } from "../../services/media-coverage.service";

/* ======================== Helpers ======================== */

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  const now = Date.now();
  const ms = now - dt.getTime();
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(ms / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function buildActivityFeed(posts, achievements, certs, gallery, mediaCoverage) {
  const activities = [];
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

  // Helper to ensure date is a Date object
  const ensureDate = (d) => (d instanceof Date ? d : new Date(d || 0));

  // Posts
  (posts || []).forEach((p) => {
    const date = ensureDate(p.createdAt || p.updatedAt);
    activities.push({
      id: `post-${p._id}`,
      type: "post",
      date: date,
      dateText: formatDate(date),
      title: p.title || "Untitled Post",
      icon: "📝",
      link: `/updates/${p.slug}`,
      color: "blue",
      description: p.excerpt || p.content?.slice(0, 100).replace(/<[^>]*>/g, ""),
    });
  });

  // Achievements
  (achievements || []).forEach((e) => {
    const date = ensureDate(e.date);
    activities.push({
      id: `achievement-${e._id}`,
      type: "achievement",
      date: date,
      dateText: formatDate(date),
      title: e.title || "Achievement",
      icon: "🏆",
      link: "/achievements",
      color: "green",
      description: `${e.level} • ${e.role}${e.location ? ` • ${e.location}` : ""}`,
    });
  });

  // Certifications
  (certs || []).forEach((c) => {
    const date = ensureDate(c.issueDate);
    activities.push({
      id: `cert-${c._id}`,
      type: "cert",
      date: date,
      dateText: formatDate(date),
      title: c.title || "Certification",
      icon: "📜",
      link: "/certifications",
      color: "purple",
      description: c.issuer || "Certificate",
    });
  });

  // Gallery
  (gallery || []).forEach((g) => {
    const date = ensureDate(g.createdAt);
    activities.push({
      id: `gallery-${g._id}`,
      type: "gallery",
      date: date,
      dateText: formatDate(date),
      title: g.title || "Gallery Image",
      icon: "📸",
      link: "/gallery",
      color: "yellow",
      description: g.album || "General",
      image: g.imageUrl,
    });
  });

  // Media Coverage
  (mediaCoverage || []).forEach((m) => {
    const date = ensureDate(m.createdAt);
    activities.push({
      id: `media-${m._id}`,
      type: "media",
      date: date,
      dateText: formatDate(date),
      title: m.title || "Media Coverage",
      icon: "📰",
      link: "/media-coverage",
      color: "orange",
      description: m.type || "News",
      image: m.coverImageUrl,
    });
  });

  // Sort by date descending
  return activities
    .filter((a) => {
      const ts = a?.date?.getTime?.();
      return Number.isFinite(ts) && now - ts <= oneWeekMs;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/* ======================== Component ======================== */

export default function ActivityFeed() {
  const postsQ = useQuery({
    queryKey: ["activity-posts"],
    queryFn: PostsAPI.listPublished,
  });

  const eventsQ = useQuery({
    queryKey: ["activity-achievements"],
    queryFn: AchievementsAPI.list,
  });

  const certsQ = useQuery({
    queryKey: ["activity-certs"],
    queryFn: CertificationsAPI.list,
  });

  const galleryQ = useQuery({
    queryKey: ["activity-gallery"],
    queryFn: GalleryAPI.list,
  });

  const mediaCoverageQ = useQuery({
    queryKey: ["activity-media-coverage"],
    queryFn: MediaCoverageAPI.listPublished,
  });

  const activities = useMemo(
    () => buildActivityFeed(postsQ.data, eventsQ.data, certsQ.data, galleryQ.data, mediaCoverageQ.data),
    [postsQ.data, eventsQ.data, certsQ.data, galleryQ.data, mediaCoverageQ.data]
  );

  const isLoading = postsQ.isLoading || eventsQ.isLoading || certsQ.isLoading || galleryQ.isLoading || mediaCoverageQ.isLoading;

  return (
    <Section
      title="Recent Activity"
      subtitle="Latest updates, achievements, certifications, and gallery uploads."
      right={
        <Link className="text-sm font-semibold text-black/60 hover:text-black transition" to="/updates">
          View all →
        </Link>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-6 text-center text-black/60">
          No recent activities. Check back soon!
        </Card>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {activities.map((activity, i) => (
            <Reveal key={activity.id} delay={i * 0.03}>
              <Link to={activity.link}>
                <motion.div whileHover={{ x: 4 }}>
                  <Card className="p-4 hover:shadow-soft transition flex items-center gap-4 group">
                    {/* Icon */}
                    <div className="text-2xl shrink-0">{activity.icon}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1 group-hover:text-brand-500 transition">
                        {activity.title}
                      </div>
                      <div className="text-xs text-black/50 mt-0.5">
                        {activity.description}
                      </div>
                    </div>

                    {/* Image if available */}
                    {activity.image && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 shrink-0">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-black/40 shrink-0 whitespace-nowrap">
                      {activity.dateText}
                    </div>
                  </Card>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}



