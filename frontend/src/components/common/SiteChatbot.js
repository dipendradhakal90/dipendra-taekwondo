import { useEffect, useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import { motion } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import { AboutAPI } from "../../services/about.service";
import { AchievementsAPI } from "../../services/achievements.service";
import { CertificationsAPI } from "../../services/certifications.service";
import { AwardsAPI } from "../../services/awards.service";
import { PostsAPI } from "../../services/posts.service";
import { MediaCoverageAPI } from "../../services/media-coverage.service";
import { GalleryAPI } from "../../services/gallery.service";
import { MessagesAPI } from "../../services/messages.service";
import { CountriesAPI } from "../../services/countries.service";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CHATBOT_LOTTIE_SRC = "/hello-animation.json";
const LABEL_LINE_1 = "I am a chatbot,";
const LABEL_LINE_2 = "ask me anything.";

const SECTION_HINTS = {
  about: ["about", "profile", "who", "dipendra", "bio", "background"],
  achievements: ["achievement", "achievements", "medal", "won", "event", "competition"],
  certifications: ["certification", "certifications", "certificate", "credential", "license"],
  awards: ["award", "awards", "recognition", "honor"],
  posts: ["post", "posts", "update", "updates", "news", "article", "blog"],
  media: ["media", "coverage", "interview", "press", "newspaper", "video"],
  gallery: ["gallery", "image", "images", "photo", "photos", "picture"],
  countries: ["country", "countries", "visited", "visit", "international", "travel"],
  contact: ["contact", "email", "phone", "location", "address", "whatsapp", "message"],
};

function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value = "") {
  return normalizeText(value)
    .split(" ")
    .filter((x) => x.length > 1);
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildKnowledge(data) {
  const docs = [];

  const about = data.about || {};
  docs.push({
    section: "about",
    title: "About",
    body: [
      toText(about.profileName),
      toText(about.profileTitle),
      toText(about.heading),
      toText(about.subheading),
      toText(about.bio),
      ...(Array.isArray(about.highlights) ? about.highlights.map(toText) : []),
    ]
      .filter(Boolean)
      .join(" \n"),
    url: "/about",
  });

  (data.achievements || []).forEach((x) => {
    docs.push({
      section: "achievements",
      title: toText(x.title) || "Achievement",
      body: [toText(x.summary), toText(x.description), toText(x.organization), toText(x.location), toText(x.role), toText(x.level)]
        .filter(Boolean)
        .join(" \n"),
      url: x.slug ? `/achievements/${x.slug}` : "/achievements",
    });
  });

  (data.certifications || []).forEach((x) => {
    docs.push({
      section: "certifications",
      title: toText(x.title) || "Certification",
      body: [toText(x.issuer), toText(x.description), toText(x.credentialId)]
        .filter(Boolean)
        .join(" \n"),
      url: "/certifications",
    });
  });

  (data.awards || []).forEach((x) => {
    docs.push({
      section: "awards",
      title: toText(x.title) || "Award",
      body: [toText(x.issuer), toText(x.description)].filter(Boolean).join(" \n"),
      url: "/certifications",
    });
  });

  (data.posts || []).forEach((x) => {
    docs.push({
      section: "posts",
      title: toText(x.title) || "Post",
      body: [toText(x.excerpt), toText(x.content)].filter(Boolean).join(" \n"),
      url: x.slug ? `/updates/${x.slug}` : "/updates",
    });
  });

  (data.media || []).forEach((x) => {
    docs.push({
      section: "media",
      title: toText(x.title) || "Media Coverage",
      body: [toText(x.description), toText(x.type)].filter(Boolean).join(" \n"),
      url: toText(x.url) || "/media-coverage",
    });
  });

  (data.gallery || []).forEach((x) => {
    docs.push({
      section: "gallery",
      title: toText(x.title) || "Gallery Image",
      body: [toText(x.album)].filter(Boolean).join(" \n"),
      url: "/gallery",
    });
  });

  (data.countries || []).forEach((x) => {
    docs.push({
      section: "countries",
      title: toText(x.countryName) || "Country Visited",
      body: [toText(x.countryCode), toText(x.description), toText(x.flagEmoji)].filter(Boolean).join(" \n"),
      url: "/",
    });
  });

  const c = data.contact || {};
  docs.push({
    section: "contact",
    title: "Contact",
    body: [toText(c.email), toText(c.phone), toText(c.location)].filter(Boolean).join(" \n"),
    url: "/contact",
  });

  return docs.filter((d) => d.title || d.body);
}

function sectionIntentBoost(section, queryTokens) {
  const hints = SECTION_HINTS[section] || [];
  let boost = 0;
  for (const t of queryTokens) {
    if (hints.some((h) => h.includes(t) || t.includes(h))) boost += 2;
  }
  return boost;
}

function scoreDoc(query, queryTokens, doc) {
  const hay = normalizeText(`${doc.title} ${doc.body}`);
  if (!hay) return 0;

  let score = sectionIntentBoost(doc.section, queryTokens);
  for (const t of queryTokens) {
    if (t.length < 2) continue;
    if (hay.includes(` ${t} `) || hay.startsWith(`${t} `) || hay.endsWith(` ${t}`)) score += 3;
    else if (hay.includes(t)) score += 1;
  }

  if (normalizeText(doc.title).includes(query)) score += 4;
  return score;
}

function makeReplyFromDocs(input, docs) {
  const q = normalizeText(input);
  if (!q) return { text: "Please type your question.", links: [] };

  const queryTokens = tokenize(q);
  const ranked = docs
    .map((doc) => ({ doc, score: scoreDoc(q, queryTokens, doc) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!ranked.length) {
    return {
      text:
        "I could not find a direct match in current site content. Try asking about About, Achievements, Certifications, Awards, Posts, Media Coverage, Gallery, or Contact.",
      links: ["/about", "/achievements", "/certifications", "/updates", "/contact"],
    };
  }

  const top = ranked[0].doc;
  const related = ranked.slice(1).map((x) => x.doc.title).filter(Boolean);
  const preview = toText(top.body).replace(/\s+/g, " ").slice(0, 260);

  const lines = [];
  lines.push(`From ${top.section}: ${top.title}.`);
  if (preview) lines.push(preview + (preview.length >= 260 ? "..." : ""));
  if (related.length) lines.push(`Related: ${related.join(" | ")}.`);

  const uniqueLinks = Array.from(new Set(ranked.map((x) => x.doc.url).filter(Boolean)));
  return { text: lines.join("\n"), links: uniqueLinks };
}

function makeOwnerReply(input, about) {
  const q = normalizeText(input);
  const name = toText(about?.profileName) || "Dipendra Dhakal";
  const title = toText(about?.profileTitle) || "International Taekwondo Referee";
  const bio = toText(about?.bio).replace(/\s+/g, " ").slice(0, 220);
  if (!q) return null;

  const ownerIntents = ["who is", "owner", "about dipendra", "dipendra", "profile"];
  if (!ownerIntents.some((k) => q.includes(k))) return null;

  return {
    text: bio ? `${name} is ${title}. ${bio}${bio.length >= 220 ? "..." : ""}` : `${name} is ${title}.`,
    links: ["/about", "/contact"],
  };
}

function detectIntent(query) {
  const q = normalizeText(query);
  const intents = {
    owner: ["who is", "owner", "dipendra", "profile", "about him"],
    contact: ["contact", "email", "phone", "location", "address", "whatsapp", "reach"],
    achievements: ["achievement", "achievements", "medal", "won", "event", "competition"],
    certifications: ["certification", "certifications", "certificate", "credential", "license"],
    awards: ["award", "awards", "recognition", "honor"],
    posts: ["post", "posts", "update", "updates", "news", "article", "blog"],
    media: ["media", "coverage", "interview", "press", "newspaper", "video"],
    gallery: ["gallery", "image", "images", "photo", "photos", "picture"],
    countries: ["country", "countries", "visited", "international", "travel"],
  };

  const matched = Object.entries(intents)
    .filter(([, keys]) => keys.some((k) => q.includes(k)))
    .map(([k]) => k);

  return matched;
}

function listTopTitles(items, count = 3) {
  return (items || [])
    .map((x) => toText(x?.title || x?.countryName || x?.heading))
    .filter(Boolean)
    .slice(0, count);
}

function makePreciseReply(input, bundle, docs) {
  const intents = detectIntent(input);
  const links = [];
  const lines = [];

  if (intents.includes("owner")) {
    const name = toText(bundle.about?.profileName) || "Dipendra Dhakal";
    const title = toText(bundle.about?.profileTitle) || "International Taekwondo Referee";
    const bio = toText(bundle.about?.bio).replace(/\s+/g, " ").slice(0, 220);
    lines.push(`${name} is ${title}.`);
    if (bio) lines.push(bio + (bio.length >= 220 ? "..." : ""));
    links.push("/about", "/contact");
  }

  if (intents.includes("contact")) {
    const email = toText(bundle.contact?.email);
    const phone = toText(bundle.contact?.phone);
    const location = toText(bundle.contact?.location);
    const contactBits = [
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
      location ? `Location: ${location}` : "",
    ].filter(Boolean);
    lines.push(contactBits.length ? contactBits.join(" | ") : "Contact details are available on the Contact page.");
    links.push("/contact");
  }

  if (intents.includes("achievements")) {
    const tops = listTopTitles(bundle.achievements);
    lines.push(`Achievements published: ${(bundle.achievements || []).length}.`);
    if (tops.length) lines.push(`Top achievements: ${tops.join(" | ")}.`);
    links.push("/achievements");
  }

  if (intents.includes("certifications")) {
    const tops = listTopTitles(bundle.certifications);
    lines.push(`Certifications published: ${(bundle.certifications || []).length}.`);
    if (tops.length) lines.push(`Top certifications: ${tops.join(" | ")}.`);
    links.push("/certifications");
  }

  if (intents.includes("awards")) {
    const tops = listTopTitles(bundle.awards);
    lines.push(`Awards published: ${(bundle.awards || []).length}.`);
    if (tops.length) lines.push(`Top awards: ${tops.join(" | ")}.`);
    links.push("/certifications");
  }

  if (intents.includes("posts")) {
    const tops = listTopTitles(bundle.posts);
    lines.push(`Posts published: ${(bundle.posts || []).length}.`);
    if (tops.length) lines.push(`Latest posts: ${tops.join(" | ")}.`);
    links.push("/updates");
  }

  if (intents.includes("media")) {
    const tops = listTopTitles(bundle.media);
    lines.push(`Media coverage items: ${(bundle.media || []).length}.`);
    if (tops.length) lines.push(`Highlights: ${tops.join(" | ")}.`);
    links.push("/media-coverage");
  }

  if (intents.includes("gallery")) {
    lines.push(`Gallery images available: ${(bundle.gallery || []).length}.`);
    links.push("/gallery");
  }

  if (intents.includes("countries")) {
    const tops = listTopTitles(bundle.countries);
    lines.push(`Countries listed: ${(bundle.countries || []).length}.`);
    if (tops.length) lines.push(`Examples: ${tops.join(" | ")}.`);
    links.push("/");
  }

  if (lines.length) {
    return { text: lines.join("\n"), links: Array.from(new Set(links)) };
  }

  return makeReplyFromDocs(input, docs);
}

export default function SiteChatbot() {
  const { isDark } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [labelLine1, setLabelLine1] = useState("");
  const [labelLine2, setLabelLine2] = useState("");
  const typingTimerRef = useRef(null);
  const labelTimersRef = useRef([]);
  const messagesViewportRef = useRef(null);
  const scrollRafRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.customElements && window.customElements.get("lottie-player")) return;
    const existing = document.getElementById("lottie-player-script");
    if (existing) return;
    const script = document.createElement("script");
    script.id = "lottie-player-script";
    script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const queries = useQueries({
    queries: [
      { queryKey: ["chatbot-about"], queryFn: AboutAPI.getPublic, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-achievements"], queryFn: AchievementsAPI.list, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-certifications"], queryFn: CertificationsAPI.list, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-awards"], queryFn: AwardsAPI.list, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-posts"], queryFn: PostsAPI.listPublished, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-media"], queryFn: MediaCoverageAPI.listPublished, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-gallery"], queryFn: GalleryAPI.list, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-countries"], queryFn: CountriesAPI.list, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
      { queryKey: ["chatbot-contact"], queryFn: MessagesAPI.contactInfo, staleTime: 60_000, gcTime: 10 * 60_000, refetchOnWindowFocus: false, retry: 1 },
    ],
  });

  useEffect(() => {
    if (!open) return;
    queries.forEach((q) => {
      if (typeof q.refetch === "function") q.refetch();
    });
    // only trigger once when opening; avoid dependency loops from changing query objects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dataBundle = {
    about: queries[0]?.data || {},
    achievements: queries[1]?.data || [],
    certifications: queries[2]?.data || [],
    awards: queries[3]?.data || [],
    posts: queries[4]?.data || [],
    media: queries[5]?.data || [],
    gallery: queries[6]?.data || [],
    countries: queries[7]?.data || [],
    contact: queries[8]?.data || {},
  };

  const docs = buildKnowledge(dataBundle);

  const [messages, setMessages] = useState([
    {
      id: `m-${Date.now()}`,
      role: "bot",
      text: "Hi. I use current site content and can answer About, Achievements, Certifications, Awards, Posts, Media Coverage, Gallery, and Contact questions.",
      links: ["/about", "/achievements", "/certifications", "/updates", "/contact"],
    },
  ]);

  const quickPrompts = useMemo(
    () => [
      "Who is Dipendra Dhakal?",
      "Latest achievements",
      "Top certifications",
      "Show awards",
      "How to contact?",
      "Email and phone",
      "Show media coverage",
      "Latest posts",
      "Gallery images",
      "Countries visited",
      "Owner profile summary",
      "Where can I send message?",
    ],
    []
  );

  const initialBotMessage = useMemo(
    () => ({
      id: `m-${Date.now()}-init`,
      role: "bot",
      text: "Hi. I use current site content and can answer About, Achievements, Certifications, Awards, Posts, Media Coverage, Gallery, and Contact questions.",
      links: ["/about", "/achievements", "/certifications", "/updates", "/contact"],
    }),
    []
  );

  function clearChat() {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setMessages([initialBotMessage]);
    setText("");
  }

  function typeBotReply(reply) {
    const fullText = String(reply?.text || "");
    const links = Array.isArray(reply?.links) ? reply.links : [];
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setMessages((prev) => [...prev, { id, role: "bot", text: "", links }]);

    if (!fullText) return;
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    let cursor = 0;
    setIsTyping(true);

    typingTimerRef.current = setInterval(() => {
      cursor += 1;
      const nextText = fullText.slice(0, cursor);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: nextText } : m)));

      if (cursor >= fullText.length) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
        setIsTyping(false);
      }
    }, 20);
  }

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearLabelTimers = () => {
      labelTimersRef.current.forEach((t) => clearTimeout(t));
      labelTimersRef.current = [];
    };

    const runLabelTyping = () => {
      if (cancelled) return;
      setLabelLine1("");
      setLabelLine2("");

      let i = 0;
      const typeLine1 = () => {
        if (cancelled) return;
        if (i < LABEL_LINE_1.length) {
          i += 1;
          setLabelLine1(LABEL_LINE_1.slice(0, i));
          const t = setTimeout(typeLine1, 45);
          labelTimersRef.current.push(t);
          return;
        }
        const pause = setTimeout(typeLine2, 500);
        labelTimersRef.current.push(pause);
      };

      let j = 0;
      const typeLine2 = () => {
        if (cancelled) return;
        if (j < LABEL_LINE_2.length) {
          j += 1;
          setLabelLine2(LABEL_LINE_2.slice(0, j));
          const t = setTimeout(typeLine2, 45);
          labelTimersRef.current.push(t);
          return;
        }
        const restart = setTimeout(runLabelTyping, 1400);
        labelTimersRef.current.push(restart);
      };

      typeLine1();
    };

    runLabelTyping();

    return () => {
      cancelled = true;
      clearLabelTimers();
    };
  }, []);

  useEffect(() => {
    const el = messagesViewportRef.current;
    if (!el) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: isTyping ? "auto" : "smooth" });
      scrollRafRef.current = null;
    });
  }, [messages, isTyping]);

  function ask(raw) {
    const value = String(raw || "").trim();
    if (!value || isTyping) return;

    const ownerReply = makeOwnerReply(value, dataBundle.about);
    const reply = ownerReply || makePreciseReply(value, dataBundle, docs);

    setMessages((prev) => [...prev, { id: `m-${Date.now()}-u`, role: "user", text: value }]);
    typeBotReply(reply);
    setText("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1200]" data-disable-page-swipe="true">
      {open ? (
        <div
          className={cx(
            "w-[min(88vw,340px)] sm:w-[min(92vw,380px)] rounded-2xl border shadow-2xl overflow-hidden",
            isDark ? "bg-slate-900 border-white/10" : "bg-white border-black/10"
          )}
        >
          <div
            className={cx(
              "px-4 py-3 border-b flex items-center justify-between",
              isDark ? "border-white/10" : "border-black/10"
            )}
          >
            <div className={cx("font-bold text-sm", isDark ? "text-white" : "text-black")}>Site Assistant</div>
            <button onClick={() => setOpen(false)} className={cx(isDark ? "text-white/70" : "text-black/70")} aria-label="Close chatbot">
              <X size={18} />
            </button>
          </div>

          <div ref={messagesViewportRef} className="p-3 h-64 sm:h-72 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div key={m.id || `${m.role}-${i}`}>
                <div
                  className={cx(
                    "text-sm px-3 py-2 rounded-xl max-w-[92%] whitespace-pre-line",
                    m.role === "user"
                      ? isDark
                        ? "ml-auto bg-slate-600 text-white"
                        : "ml-auto bg-[#0b1f4d] text-white"
                      : isDark
                      ? "bg-slate-800 text-white/90"
                      : "bg-purple-600 text-white"
                  )}
                >
                  {m.text}
                </div>
                {m.role === "bot" && Array.isArray(m.links) && m.links.length ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {m.links.slice(0, 3).map((href) => (
                      <a
                        key={`${i}-${href}`}
                        href={href}
                        className={cx(
                          "text-[11px] px-2 py-0.5 rounded-full border",
                          isDark
                            ? "border-white/20 text-white/80 hover:bg-white/10"
                            : "border-black/10 text-black/70 hover:bg-black/5"
                        )}
                      >
                        {href}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {isTyping ? (
              <div
                className={cx(
                  "inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl",
                  isDark ? "bg-slate-800 text-white/70" : "bg-black/5 text-black/60"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
                <span>Typing...</span>
              </div>
            ) : null}
          </div>

          <div className={cx("px-3 pb-2 flex flex-wrap gap-2", isDark ? "bg-slate-900" : "bg-white")}>
            {quickPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => ask(p)}
                disabled={isTyping}
                className={cx(
                  "text-[11px] px-2 py-0.5 rounded-full border leading-tight disabled:opacity-50 disabled:cursor-not-allowed",
                  isDark ? "border-white/15 text-white/80 hover:bg-white/10" : "border-black/10 text-black/70 hover:bg-black/5"
                )}
              >
                {p}
              </button>
            ))}
            <div className="w-full flex justify-end pt-1">
              <button
                type="button"
                onClick={clearChat}
                disabled={isTyping}
                className={cx(
                  "text-[10px] px-2 py-0.5 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed",
                  isDark ? "border-white/20 text-white/80 hover:bg-white/10" : "border-black/10 text-black/70 hover:bg-black/5"
                )}
              >
                Clear chat
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(text);
            }}
            className={cx("p-3 border-t flex items-center gap-2", isDark ? "border-white/10" : "border-black/10")}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isTyping}
              placeholder="Ask about this site..."
              className={cx(
                "flex-1 rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-60",
                isDark ? "bg-slate-800 border-white/10 text-white" : "bg-white border-black/10 text-black"
              )}
            />
            <div className="flex flex-col items-center gap-1">
              <button
                type="submit"
                disabled={isTyping}
                className={cx(
                  "h-9 w-9 rounded-xl grid place-items-center disabled:opacity-50 disabled:cursor-not-allowed",
                  isDark ? "bg-white/10 text-white" : "bg-black text-white"
                )}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <motion.button
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "mt-3 ml-auto shadow-lg border",
          open
            ? "h-14 w-14 rounded-full p-1.5 flex items-center justify-center"
            : "flex items-center gap-0.5 rounded-full px-3 py-2",
          isDark ? "bg-black/65 text-white border-white/20" : "bg-black text-white border-black"
        )}
        animate={open ? { y: 0, rotate: 0 } : { y: [0, -7, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
        transition={open ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        aria-label="Open site chatbot"
        title="Site Assistant"
      >
        <lottie-player
          src={CHATBOT_LOTTIE_SRC}
          background="transparent"
          speed="1"
          loop
          autoplay
          style={{ width: "102px", height: "102px" }}
        />
        {!open ? (
          <span className="-ml-5 text-xs sm:text-sm font-semibold leading-tight">
            <span className="block">{labelLine1}</span>
            <span className="block">{labelLine2}</span>
          </span>
        ) : null}
      </motion.button>
    </div>
  );
}
