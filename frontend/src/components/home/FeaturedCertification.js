import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";

export default function FeaturedCertification({ cert }) {
  const { isDark } = useDarkMode();
  if (!cert) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mt-14">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={isDark ? "rounded-3xl border border-white/10 bg-slate-800 shadow-md p-8 md:p-10" : "rounded-3xl border border-black/10 bg-white shadow-md p-8 md:p-10"}
      >
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className={isDark ? "text-xs font-semibold tracking-widest text-white/50" : "text-xs font-semibold tracking-widest text-black/50"}>
              FEATURED CERTIFICATION
            </div>

            <h3 className={isDark ? "text-2xl md:text-3xl font-extrabold mt-2 text-white" : "text-2xl md:text-3xl font-extrabold mt-2 text-black"}>
              {cert.title}
            </h3>

            <div className={isDark ? "text-sm text-white/60 mt-2" : "text-sm text-black/60 mt-2"}>
              {cert.issuer} • {new Date(cert.issueDate).toDateString()}
            </div>

            {cert.description && (
              <p className={isDark ? "mt-4 text-white/70 leading-relaxed max-w-xl" : "mt-4 text-black/70 leading-relaxed max-w-xl"}>
                {cert.description}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={isDark ? "inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-white text-black font-semibold text-sm hover:opacity-90" : "inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-black text-white font-semibold text-sm hover:opacity-90"}
                >
                  View Credential →
                </a>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className={isDark ? "h-32 w-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-extrabold text-white/40" : "h-32 w-32 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center text-xl font-extrabold text-black/40"}>
              🏅
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}