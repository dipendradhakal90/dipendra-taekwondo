import { Mail, Instagram, Facebook, Linkedin, Youtube, Phone, MessageCircle } from "lucide-react";
import { useDarkMode } from "../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { isDark } = useDarkMode();

  return (
    <footer className={cx("mt-24 border-t", isDark ? "border-white/10 bg-slate-900" : "border-black/10 bg-white")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className={cx("text-sm font-semibold mb-3", isDark ? "text-white" : "text-black")}>Contact</div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 text-sm">
                <a href="mailto:your@email.com" className={cx("flex items-center gap-2 transition", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}>
                  <Mail size={16} /> your@email.com
                </a>
                <a href="tel:+977" className={cx("flex items-center gap-2 transition", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}>
                  <Phone size={16} /> +977 XXXXX
                </a>
                <a href="https://wa.me/977" target="_blank" rel="noreferrer" className={cx("flex items-center gap-2 transition", isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")}>
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noreferrer"
                className={cx("p-2 rounded-full border transition", isDark ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-black/10 text-black/60 hover:text-black hover:bg-black/5")}
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://facebook.com/yourprofile"
                target="_blank"
                rel="noreferrer"
                className={cx("p-2 rounded-full border transition", isDark ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-black/10 text-black/60 hover:text-black hover:bg-black/5")}
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>

              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noreferrer"
                className={cx("p-2 rounded-full border transition", isDark ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-black/10 text-black/60 hover:text-black hover:bg-black/5")}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              <a
                href="https://youtube.com/yourchannel"
                target="_blank"
                rel="noreferrer"
                className={cx("p-2 rounded-full border transition", isDark ? "border-white/10 text-white/60 hover:text-white hover:bg-white/5" : "border-black/10 text-black/60 hover:text-black hover:bg-black/5")}
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className={cx("border-t py-8", isDark ? "border-white/10" : "border-black/10")}>
          <div className="flex items-center justify-center">
            <div className={cx("text-sm", isDark ? "text-white/50" : "text-black/50")}>
              &copy; {year} Dipendra Dhakal Portal. All Rights Reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
