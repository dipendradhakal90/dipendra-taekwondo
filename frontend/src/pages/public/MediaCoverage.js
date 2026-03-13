import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MediaCoverageAPI } from "../../services/media-coverage.service";
import Section from "../../components/ui/Section";
import LoaderFull from "../../components/common/LoaderFull";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const typeIcons = {
  newspaper: "📰",
  video: "🎥",
  magazine: "📕",
  "news-portal": "📰",
  other: "🔗",
};

const typeColors = {
  newspaper: "bg-blue-50 text-blue-700 border-blue-200",
  video: "bg-red-50 text-red-700 border-red-200",
  magazine: "bg-purple-50 text-purple-700 border-purple-200",
  "news-portal": "bg-indigo-50 text-indigo-700 border-indigo-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

function MediaCoverageCard({ item, index, isDark }) {
  const typeIcon = typeIcons[item.type] || "🔗";
  const typeColor = typeColors[item.type] || typeColors.other;

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative rounded-2xl border border-black/10 overflow-hidden hover:border-black/20 transition-all hover:shadow-lg"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {item.coverImageUrl && (
          <div className="sm:w-40 sm:h-32 bg-black/5 overflow-hidden flex-shrink-0">
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className={cx("text-sm font-semibold group-hover:text-brand-500 transition-colors line-clamp-2", isDark ? "text-white" : "text-black")}>
                {typeIcon} {item.title}
              </div>
              {item.description && (
                <div className={cx("text-sm mt-1 line-clamp-2", isDark ? "text-white/50" : "text-black/50")}>
                  {item.description}
                </div>
              )}
            </div>

            {/* Type badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 ${typeColor}`}>
              {item.type.replace("-", " ")}
            </div>
          </div>

          {/* Footer */}
          <div className={cx("mt-3 text-xs", isDark ? "text-white/40" : "text-black/40")}>
            {item.createdAt && (
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className={isDark ? "absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 w-8 h-8 rounded-full bg-white/5 group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" : "absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 w-8 h-8 rounded-full bg-black/5 group-hover:bg-brand-500 group-hover:text-black flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"}>
          →
        </div>
      </div>
    </motion.a>
  );
}

export default function MediaCoverage() {
  const { isDark } = useDarkMode();
  const q = useQuery({
    queryKey: ["media-coverage-public"],
    queryFn: MediaCoverageAPI.listPublished,
  });

  if (q.isLoading) return <LoaderFull label="Loading media coverage..." />;

  const items = q.data || [];

  return (
    <div className={cx("min-h-screen transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
      <PageHead
        title="Media Coverage"
        description="News articles, videos, and media features about my achievements and taekwondo journey"
      />

      <Section
        title="Media Coverage"
        topPaddingClass="pt-20 md:pt-24"
        subtitle="Featured in news articles, videos, and media outlets covering taekwondo career and achievements."
      >
        <div className="w-full">
          {items.length === 0 ? (
            <div className={cx("rounded-2xl border p-12 text-center", isDark ? "border-white/10 text-white/50" : "border-black/10 text-black/50")}>
              No media coverage yet
            </div>
          ) : (
            <div className="grid gap-4">
              {items.map((item, idx) => (
                <MediaCoverageCard key={item._id} item={item} index={idx} isDark={isDark} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
