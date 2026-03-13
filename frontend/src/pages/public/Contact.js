import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHead from "../../components/common/PageHead";
import Section from "../../components/ui/Section";
import { MessagesAPI } from "../../services/messages.service";

import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Contact() {
  const { isDark } = useDarkMode();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const contactQ = useQuery({
    queryKey: ["contact-info-public"],
    queryFn: MessagesAPI.contactInfo,
  });

  const sendM = useMutation({
    mutationFn: MessagesAPI.send,
    onSuccess: () => {
      toast.success("Message sent successfully! I'll get back to you soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => toast.error("Failed to send message")
  });

  function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message)
      return toast.error("Please fill in all required fields");
    sendM.mutate(form);
  }

  const contactInfo = contactQ.data || {};
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: contactInfo.email ?? "",
      link: contactInfo.email ? `mailto:${contactInfo.email}` : "#",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      title: "Phone",
      value: contactInfo.phone ?? "",
      link: contactInfo.phone ? `tel:${contactInfo.phone.replace(/\s+/g, "")}` : "#",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Location",
      value: contactInfo.location ?? "",
      link: "#",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className={cx("transition-colors duration-300", isDark ? "bg-slate-950" : "bg-white")}>
      <PageHead
        title="Contact"
        description="Get in touch for official communication, inquiries, or collaboration opportunities."
        path="/contact"
      />

      <Section
        title="Get In Touch"
        topPaddingClass="pt-20 md:pt-24"
        subtitle="Have a question or want to collaborate? I'd love to hear from you. Drop me a message and I'll respond as soon as possible."
        isDark={isDark}
      >
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.a
                key={method.title}
                href={method.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <Card className={cx("p-6 h-full hover:shadow-soft transition border", isDark ? "border-white/10 bg-slate-800 hover:border-brand-500" : "border-transparent hover:border-brand-500")}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <Icon size={24} className={isDark ? "text-white" : "text-white"} />
                  </div>
                  <h3 className={cx("font-semibold text-lg", isDark ? "text-white" : "text-black")}>{method.title}</h3>
                  <p className={cx("text-sm mt-1", isDark ? "text-white/60" : "text-black/60")}>{method.value}</p>
                </Card>
              </motion.a>
            );
          })}
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className={cx("p-5 sm:p-6 md:p-10", isDark ? "bg-slate-800" : "bg-white")}>
            <h2 className={cx("text-2xl font-bold mb-6", isDark ? "text-white" : "text-black")}>Send Me a Message</h2>

            <form onSubmit={submit} className="space-y-5">
              {/* Name */}
              <div>
                <label className={cx("block text-sm font-semibold mb-2", isDark ? "text-white/80" : "text-black")}>Name *</label>
                <input
                  type="text"
                  className={cx("w-full px-4 py-3 border rounded-xl focus:outline-none transition", isDark ? "bg-slate-700 border-slate-600 focus:border-brand-500 text-white" : "border-black/10 focus:border-brand-500")}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className={cx("block text-sm font-semibold mb-2", isDark ? "text-white/80" : "text-black")}>Email *</label>
                <input
                  type="email"
                  className={cx("w-full px-4 py-3 border rounded-xl focus:outline-none transition", isDark ? "bg-slate-700 border-slate-600 focus:border-brand-500 text-white" : "border-black/10 focus:border-brand-500")}
                  placeholder="your.email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className={cx("block text-sm font-semibold mb-2", isDark ? "text-white/80" : "text-black")}>Subject</label>
                <input
                  type="text"
                  className={cx("w-full px-4 py-3 border rounded-xl focus:outline-none transition", isDark ? "bg-slate-700 border-slate-600 focus:border-brand-500 text-white" : "border-black/10 focus:border-brand-500")}
                  placeholder="What is this about?"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              {/* Message */}
              <div>
                <label className={cx("block text-sm font-semibold mb-2", isDark ? "text-white/80" : "text-black")}>Message *</label>
                <textarea
                  className={cx("w-full px-4 py-3 border rounded-xl focus:outline-none transition min-h-[160px] resize-none", isDark ? "bg-slate-700 border-slate-600 focus:border-brand-500 text-white" : "border-black/10 focus:border-brand-500")}
                  placeholder="Tell me more..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                className={isDark ? "w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold py-4 hover:shadow-lg transition" : "w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold py-4 hover:shadow-lg transition"}
                onClick={submit}
                disabled={sendM.isPending}
              >
                <Send size={18} className="mr-2" />
                {sendM.isPending ? "Sending..." : "Send Message"}
              </Button>

              <p className={cx("text-xs text-center", isDark ? "text-white/50" : "text-black/50")}>
                I typically respond within 24 hours.
              </p>
            </form>
          </Card>
        </motion.div>
      </Section>
    </div>
  );
}
