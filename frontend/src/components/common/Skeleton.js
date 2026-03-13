export default function Skeleton({ className = "" }) {
  return (
    <div
      className={
        "rounded-2xl bg-gradient-to-r from-black/5 via-black/10 to-black/5 bg-[length:700px_100%] animate-shimmer " +
        className
      }
    />
  );
}
