import { motion } from "framer-motion";
import Container from "../common/Container";
import { scaleIn } from "../../theme/motion";

export default function CTA() {
  return (
    <section className="py-12">
      <Container>
        <motion.div
          variants={scaleIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-3xl border border-black/10 bg-gradient-to-br from-black/[0.03] to-white p-7 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-black/60">Let’s connect</div>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-2">
                Invite for tournaments, seminars & officiating
              </h3>
              <p className="mt-2 text-black/60 max-w-2xl">
                For official communication, collaborations, achievement-related invitations, or verification, use the contact form.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="rounded-2xl px-5 py-3 text-sm font-semibold border border-black/10 hover:bg-black/[0.03] transition"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to top
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
