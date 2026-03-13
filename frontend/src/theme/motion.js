export const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: "easeOut" } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};
