import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import Reveal from "../../components/ui/Reveal";
import Section from "../../components/ui/Section";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/common/Skeleton";
import SocialShare from "../../components/common/SocialShare";
import PageHead from "../../components/common/PageHead";
import { useDarkMode } from "../../context/DarkModeContext";
import { PostsAPI } from "../../services/posts.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PostDetails() {
  const { slug } = useParams();
  const { isDark } = useDarkMode();

  const q = useQuery({
    queryKey: ["post-details", slug],
    queryFn: () => PostsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  const post = q.data;
  const postCover =
    post?.coverImageUrl ||
    post?.coverImage ||
    post?.imageUrl ||
    post?.thumbnailUrl ||
    post?.bannerUrl ||
    post?.image ||
    "";

  /* ================= Loading ================= */
  if (q.isLoading) {
    return (
      <Section title="Loading" subtitle="Fetching article...">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <Skeleton className="h-64 w-full rounded-3xl mb-6" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-full mb-3" />
        <Skeleton className="h-5 w-3/4" />
      </Section>
    );
  }

  /* ================= Not found ================= */
  if (!post) {
    return (
      <Section title="Post not found" subtitle="This article may not exist.">
        <Card className={cx("p-6", isDark ? "text-white/60" : "text-black/60")}>
          The requested update could not be found.
          <div className="mt-4">
            <Link to="/updates" className="text-brand-600 font-semibold hover:underline">
              ← Back to updates
            </Link>
          </div>
        </Card>
      </Section>
    );
  }

  /* ================= Page ================= */
  const pageUrl = `${window.location.origin}/updates/${slug}`;

  return (
    <>
      <PageHead
        title={post.title}
        description={post.excerpt || post.content?.slice(0, 160)}
        path={`/updates/${slug}`}
        type="article"
      />
      <Section
        title=""
        right={
          <Link to="/updates" className={cx("text-sm font-semibold", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}>
            ← Back
          </Link>
        }
      >
        <div className="max-w-3xl mx-auto">

          {/* Meta */}
          <Reveal>
            <div className={cx("flex items-center justify-between flex-wrap gap-4 text-sm", isDark ? "text-white/50" : "text-black/50")}>
              <span>
                {post.createdAt ? new Date(post.createdAt).toDateString() : ""}
              </span>
            </div>
          </Reveal>

          {/* Featured Image */}
          {postCover && (
            <Reveal delay={0.1}>
              <div className={cx("mt-6 overflow-hidden rounded-3xl border shadow-sm", isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5")}>
                <img
                  src={postCover}
                  alt={post.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </Reveal>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <Reveal delay={0.15}>
              <p className={cx("mt-6 text-lg font-medium", isDark ? "text-white/70" : "text-black/70")}>
                {post.excerpt}
              </p>
            </Reveal>
          )}

          {/* Content */}
          <Reveal delay={0.2}>
            <article className={cx("mt-6 leading-relaxed whitespace-pre-wrap space-y-4", isDark ? "text-white/80" : "text-black/80")}>
              {post.content}
            </article>
          </Reveal>

          {/* Social Share */}
          <Reveal delay={0.25}>
            <div className={cx("mt-10 pt-6 border-t", isDark ? "border-white/10" : "border-black/10")}>
              <SocialShare
                title={post.title}
                url={pageUrl}
                description={post.excerpt || post.content?.slice(0, 160)}
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

