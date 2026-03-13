import { motion } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import Container from "../common/Container";
import { fadeUp, stagger } from "../../theme/motion";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Section({ title, subtitle, right, children, topPaddingClass }) {
  const { isDark } = useDarkMode();
  return (
    <section className={cx("max-w-6xl mx-auto px-4 pb-8 scroll-mt-32", topPaddingClass || "pt-12 md:pt-14", isDark ? "text-white" : "text-black")}>
      <Container>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              {title ? (
                <h2 className={cx("text-2xl md:text-3xl font-extrabold", isDark ? "text-white" : "text-black")}>
                  {title}
                </h2>
              ) : null}
            </div>
            {right ? <div>{right}</div> : null}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-4">
            {children}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
