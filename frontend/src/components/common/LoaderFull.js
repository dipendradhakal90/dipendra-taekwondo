import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function LoaderFull({ label = "Loading..." }) {
  const { isDark } = useDarkMode();
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <div className={cx("h-10 w-10 rounded-full border-4 border-t animate-spin", isDark ? "border-white/10 border-t-white" : "border-black/10 border-t-black")} />
        <p className={cx("text-sm", isDark ? "text-white/60" : "text-black/60")}>{label}</p>
      </div>
    </div>
  );
}
