export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold " +
        "bg-black text-white hover:opacity-90 active:scale-[0.99] transition " +
        "disabled:opacity-60 disabled:pointer-events-none " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 " +
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
