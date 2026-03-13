import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PageHead from "../../components/common/PageHead";
import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import { useDarkMode } from "../../context/DarkModeContext";
import { AchievementsAPI } from "../../services/achievements.service";
import { buildAchievementItems, slugifyAchievement } from "../../utils/achievements";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AchievementDetails() {
  const { isDark } = useDarkMode();
  const { slug = "" } = useParams();

  const q = useQuery({
    queryKey: ["achievements-list"],
    queryFn: async () => await AchievementsAPI.list(),
  });

  const items = useMemo(() => buildAchievementItems(q.data || []), [q.data]);
  const achievement = useMemo(
    () => items.find((x) => x.slug === slug || slugifyAchievement(x.title) === slug),
    [items, slug]
  );

  if (q.isLoading) {
    return (
      <div className={cx("min-h-[60vh] px-4 py-24", isDark ? "bg-slate-950" : "bg-white")}>
        <div className="max-w-6xl mx-auto grid gap-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-[440px] rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className={cx("min-h-[60vh] px-4 py-24", isDark ? "bg-slate-950 text-white" : "bg-white text-black")}>
        <div className="max-w-4xl mx-auto">
          <Card className={cx("p-8 rounded-2xl", isDark ? "bg-slate-900 border-white/10" : "")}>
            <h1 className="text-2xl font-extrabold">Achievement not found.</h1>
            <p className={cx("mt-2", isDark ? "text-white/70" : "text-black/65")}>
              The requested detail page is unavailable.
            </p>
            <Link
              to="/achievements"
              className={cx("mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-semibold", isDark ? "bg-white text-black" : "bg-black text-white")}
            >
              Back to Achievements
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={achievement.title}
        description={achievement.summary || achievement.description || "Achievement details"}
        image={achievement.imageUrl}
        path={`/achievements/${achievement.slug}`}
      />

      <div className={cx("transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
        <Section
          title="Achievements"
          topPaddingClass="pt-20 md:pt-24"
          subtitle={
            <span>
              <Link to="/achievements" className={cx("font-semibold hover:underline", isDark ? "text-white/75" : "text-black/75")}>
                Achievements
              </Link>{" "}
              / Details
            </span>
          }
        >
          <Card className={cx("overflow-hidden rounded-2xl", isDark ? "bg-slate-900 border-white/10" : "")}>
            <img
              src={achievement.imageUrl}
              alt={achievement.title}
              className={cx("w-full object-cover", "max-h-[560px]", isDark ? "bg-slate-950" : "bg-black/5")}
            />

            <div className="p-5 md:p-7">
              <h1 className={cx("text-2xl md:text-3xl font-extrabold leading-snug", isDark ? "text-white" : "text-black")}>
                {achievement.title}
              </h1>

              <p className={cx("mt-4 text-base leading-relaxed whitespace-pre-line", isDark ? "text-white/80" : "text-black/75")}>
                {achievement.description || achievement.summary || "No detailed description provided yet."}
              </p>

              {(achievement.date || achievement.location || achievement.organization || achievement.role || achievement.level) && (
                <div className={cx("mt-5 text-sm font-semibold", isDark ? "text-white/65" : "text-black/60")}>
                  {achievement.date ? new Date(achievement.date).toLocaleDateString() : ""}
                  {achievement.location ? ` • ${achievement.location}` : ""}
                  {achievement.organization ? ` • ${achievement.organization}` : ""}
                  {achievement.role ? ` • ${achievement.role}` : ""}
                  {achievement.level ? ` • ${achievement.level}` : ""}
                </div>
              )}
            </div>
          </Card>
        </Section>
      </div>
    </>
  );
}


