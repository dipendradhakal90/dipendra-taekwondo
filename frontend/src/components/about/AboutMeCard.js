import { useMemo } from "react";

import Card from "../ui/Card";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AboutMeCard({
  isDark,
  bio,
  title = "About Me",
  subtitle = "A short personal introduction from the CMS.",
  showHeader = true,
  maxHeightClass = "max-h-[420px]",
  className = "",
}) {
  const content = useMemo(() => (bio || "").trim(), [bio]);

  return (
    <Card className={cx("p-5 rounded-[28px] border shadow-sm backdrop-blur relative overflow-hidden", isDark ? "border-white/10 bg-slate-800/90" : "border-black/10 bg-white/90", className)}>
      {showHeader ? <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/[0.04] to-transparent" /> : null}

      {showHeader ? (
        <div className="relative flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className={cx("text-xl md:text-2xl font-extrabold tracking-tight", isDark ? "text-white" : "text-black")}>
              {title}
              <span className="text-brand-500">.</span>
            </div>
            <div className={cx("text-xs md:text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>{subtitle}</div>
          </div>
        </div>
      ) : null}

      <div
        className={cx(
          "relative text-sm leading-relaxed whitespace-pre-wrap pr-2 overflow-y-auto",
          showHeader ? "mt-4" : "mt-1",
          maxHeightClass,
          isDark ? "text-white/75" : "text-black/75"
        )}
      >
        {content ? content : "—"}
      </div>
    </Card>
  );
}
