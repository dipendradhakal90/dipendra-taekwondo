import { normalizeImageUrl as normalizeRawImageUrl, toDisplayImageUrl } from "./imageUrl";

export const REF_HOST = "https://www.kabirajnegilama.com.np";
export const ACHIEVEMENTS_PAGE_SIZE = 9;

export const fallbackAchievements = [
  {
    id: "fallback-1",
    title: "Under my coaching, Palesha Goverdhan won Nepal's first-ever Paralympic bronze medal at the Paris 2024 Paralympic Games, making history.",
    summary: "Under my coaching, my athlete Palesha Goverdhan won Nepal's first-ever Paralympic bronze medal at the Paris 2024 Paralympic Games.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1737476918_1476066544_From WT.png`,
  },
  {
    id: "fallback-2",
    title: "My coaching, Renu Tamang won a bronze medal for Nepal at the 2025 Asian Youth Para Games, held in Dubai, United Arab Emirates, from December 7 to 14, 2025.",
    summary: "Renu Tamang won a bronze medal for Nepal at the 2025 Asian Youth Para Games in Dubai.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1765944168_508371149_Renu Tamang and her coach Kabiraj Negi Lama in Asian youth para games 2025.jpg`,
  },
  {
    id: "fallback-3",
    title: "Under my coaching, my athlete Palesha Goverdhan won a bronze medal for Nepal at the 10th Asian Para Taekwondo Championship, held in Kuching, Malaysia, on July 1, 2025.",
    summary: "Palesha Goverdhan won bronze for Nepal at the 10th Asian Para Taekwondo Championship in Kuching.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1754294074_1963875422_Under my coaching, my athlete Palesha Goverdhan won a bronze medal for Nepal at the 10th Asian Para Taekwondo Championship, held in Kuching, Malaysia, on July 1, 2025..jpg`,
  },
  {
    id: "fallback-4",
    title: "I coached my athlete Shrijana Ghising to win Nepal's first-ever historic gold medal at the Riyadh 2022 World Para Taekwondo Grand Prix Final (G10).",
    summary: "Shrijana Ghising won Nepal's first historic gold at the Riyadh 2022 World Para Taekwondo Grand Prix Final.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747468_834478005_Riyadh saudi Arabia gold medal shrijana ghising.jpg`,
  },
  {
    id: "fallback-5",
    title: "I coached at the Asian Qualification Tournament for the Paris 2024 Paralympics, where Palesha Goverdhan won a gold medal and qualified for Paris 2024.",
    summary: "At the Paris 2024 Asian Qualification Tournament, Palesha Goverdhan secured gold and qualification.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747793_81190441_palesha wins gold medal for paris 2024 paraolympic game .jpg`,
  },
  {
    id: "fallback-6",
    title: "I coached at the 2021 Asian Youth Para Games, where Palesha Goverdhan won a gold medal, and Shrijana Ghising and Bishal Garbuja secured silver and bronze medals, respectively.",
    summary: "The 2021 Asian Youth Para Games campaign delivered gold, silver, and bronze medals for Nepal.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747605_946877544_Palesha Goverdhan won a gold medal, while Shrijana Ghising and Bishal Garbuja each won a silver and a bronze at the 2021 Asian Youth Para Games for Nepal.jpg`,
  },
  {
    id: "fallback-7",
    title: "I also coached athlete Bharat Singh Mahata, who competed in the Paris 2024 Paralympic Games.",
    summary: "Bharat Singh Mahata represented Nepal at the Paris 2024 Paralympic Games.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1738048499_371018202_Nepal team Player Bharat Singh Mahata and Coach Kabiraj Negi Lama at the  Paris for Paris 2024 Paralympics, Grand Palais.jpg`,
  },
  {
    id: "fallback-8",
    title: "As the team coach at the 2022 Asian Para Games, I coached my athlete Palesha Goverdhan to win a bronze medal, making her the first Nepali para-athlete to earn a medal at the Asian Para Games.",
    summary: "Palesha Goverdhan became the first Nepali para-athlete to medal at the Asian Para Games.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747547_1907855145_palesha bronze medal at 2022 aisan para games china .jpg`,
  },
  {
    id: "fallback-9",
    title: "I coached at the Tokyo 2020 Paralympic Games, where my athlete, Palesha Goverdhan, won repechage matches against athletes from the United States and Serbia.",
    summary: "At Tokyo 2020 Paralympics, Palesha Goverdhan won repechage matches against USA and Serbia opponents.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747828_1166220468_palesha goverdhan winner two fights tokyo 2020 summer.jpg`,
  },
  {
    id: "fallback-10",
    title: "I coached at the 8th World Para Taekwondo Championships 2019, where athlete Bikram Shrestha won a bronze medal in Antalya, Turkey.",
    summary: "Bikram Shrestha won bronze at the 8th World Para Taekwondo Championships 2019 in Antalya.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747646_1301922088_8th 2019 World Para Taekwondo Championships, where athlete Bikram Shrestha won a bronze medal for Nepal.JPG`,
  },
  {
    id: "fallback-11",
    title: "I served as the Team Coach at the 3rd Asian Para Taekwondo Championships 2017 in South Korea, where para athlete Ranjana Dhami won a bronze medal.",
    summary: "Ranjana Dhami won bronze at the 3rd Asian Para Taekwondo Championships 2017 in South Korea.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747700_1875688825_3rd 2017 Asian Para Taekwondo Championships in Choenchoun, South Korea, where para athlete Ranjana Dhami won a bronze medal for Nepal.jpg`,
  },
  {
    id: "fallback-12",
    title: "I coached at the 4th WT President's Cup Asian Region Para Taekwondo Championships, where Shrijana Ghising won a silver medal for Nepal.",
    summary: "Shrijana Ghising won silver at the 4th WT President's Cup Asian Region Para Taekwondo Championships.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1737603005_71011424_WT President cup Shrijana Ghising.JPG`,
  },
  {
    id: "fallback-13",
    title: "I was a coach at the Sharjah Qualification Tournament for the Hangzhou 2022 Asian Para Games, where my athlete, Ranjana Dhami, won a bronze medal for Nepal.",
    summary: "Ranjana Dhami won bronze at the Sharjah qualification tournament for Hangzhou 2022 Asian Para Games.",
    imageUrl: `${REF_HOST}/upload_file/images/achievement/1735747742_1642965175_sharjah qualification tournament for hangzhou 2022 asian para games UAE.jpg`,
  },
];

export function slugifyAchievement(title = "") {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeImageUrl(url) {
  return toDisplayImageUrl(url);
}

export function buildAchievementItems(items = []) {
  const valid = Array.isArray(items) ? items : [];
  return valid
    .map((e) => ({
      id: e?._id || `achievement-${Math.random()}`,
      title: (e?.title || "").trim(),
      summary: (e?.summary || e?.description || "").trim(),
      imageUrl: toDisplayImageUrl((e?.imageUrl || "").trim()),
      description: (e?.description || "").trim(),
      organization: (e?.organization || "").trim(),
      role: (e?.role || "").trim(),
      level: (e?.level || "").trim(),
      location: (e?.location || "").trim(),
      date: e?.date || null,
    }))
    .filter((x) => x.title)
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    })
    .map((x) => ({ ...x, slug: slugifyAchievement(x.title) }));
}

export function getAchievementsWithFallback(items = []) {
  const fromApi = buildAchievementItems(items);
  if (fromApi.length) return fromApi;
  return fallbackAchievements.map((x) => ({
    ...x,
    imageUrl: toDisplayImageUrl(normalizeRawImageUrl(x.imageUrl)),
    slug: slugifyAchievement(x.title),
    description: x.summary || "",
    organization: "",
    role: "",
    level: "",
    location: "",
    date: null,
  }));
}
