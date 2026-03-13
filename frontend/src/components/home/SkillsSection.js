// frontend/src/components/home/SkillsSection.js
import { motion } from "framer-motion";
import Section from "../ui/Section";
import Card from "../ui/Card";
import Reveal from "../ui/Reveal";
import { useDarkMode } from "../../context/DarkModeContext";

const SKILLS = [
  {
    category: "Coaching",
    color: "bg-blue-500",
    items: [
      "Taekwondo Training",
      "Athlete Development",
      "Sports Psychology",
      "Performance Analysis",
    ],
  },
  {
    category: "Officiating",
    color: "bg-green-500",
    items: [
      "Competition Judging",
      "Rule Enforcement",
      "Tournament Management",
      "Official Certification",
    ],
  },
  {
    category: "Technical",
    color: "bg-purple-500",
    items: [
      "Video Analysis",
      "Technique Training",
      "Equipment Management",
      "Safety Protocols",
    ],
  },
  {
    category: "Leadership",
    color: "bg-amber-500",
    items: [
      "Team Management",
      "Strategic Planning",
      "International Networking",
      "Program Development",
    ],
  },
];

export default function SkillsSection() {
  const { isDark } = useDarkMode();
  return (
    <Section
      title="Expertise & Skills"
      subtitle="Specialized knowledge and competencies developed through years of professional practice."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SKILLS.map((skill, idx) => (
          <Reveal key={skill.category} delay={idx * 0.06}>
            <Card className="p-6 h-full">
              {/* Category Badge */}
              <div className={`w-12 h-12 rounded-xl ${skill.color} mb-4 flex items-center justify-center text-white`}>
                <span className="text-lg font-bold">
                  {skill.category.charAt(0)}
                </span>
              </div>

              {/* Category Title */}
              <h3 className={isDark ? "font-semibold text-lg mb-4 text-white" : "font-semibold text-lg mb-4 text-black"}>
                {skill.category}
              </h3>

              {/* Skills List */}
              <div className="space-y-2">
                {skill.items.map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <div className={isDark ? "w-2 h-2 rounded-full bg-white/30" : "w-2 h-2 rounded-full bg-black/40"} />
                    <span className={isDark ? "text-sm text-white/70" : "text-sm text-black/70"}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* Expertise Highlight */}
      <Card className={isDark ? "mt-8 p-8 bg-slate-700/30 border border-white/10" : "mt-8 p-8 bg-black/[0.02] border border-black/5"}>
        <div className="text-center">
          <h4 className={isDark ? "text-SM font-bold mb-4 text-white" : "text-SM font-bold mb-4 text-black"}>Core Competencies</h4>
          <div className="flex justify-center flex-wrap gap-3">
            {[
              "International Standards",
              "Youth Development",
              "Competitive Excellence",
              "Ethical Leadership",
              "Continuous Innovation",
            ].map((comp) => (
              <span
                key={comp}
                className={isDark ? "px-4 py-2 rounded-full bg-slate-800 border border-white/10 text-sm font-medium text-white" : "px-4 py-2 rounded-full bg-white border border-black/10 text-sm font-medium text-black"}
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Section>
  );
}
