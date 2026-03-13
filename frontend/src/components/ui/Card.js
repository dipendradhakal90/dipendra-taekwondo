export default function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-3xl border border-black/10 bg-white shadow-soft ring-1 ring-black/5 " +
        "transition-colors dark:border-white/10 dark:bg-slate-900/60 dark:ring-white/10 " +
        className
      }
    >
      {children}
    </div>
  );
}

