import { motion } from "framer-motion";
import { fadeUp } from "../../theme/motion";

export default function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      variants={{
        hidden: fadeUp.hidden,
        show: { ...fadeUp.show, transition: { ...fadeUp.show.transition, delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
