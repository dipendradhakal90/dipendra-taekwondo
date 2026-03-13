import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeAchievement(item) {
  if (!item) return item;
  return {
    ...item,
    imageUrl: toDisplayImageUrl(item.imageUrl),
  };
}

function normalizeAchievementList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeAchievement);
}

export const AchievementsAPI = {
  list: () => api.get("/achievements").then((r) => normalizeAchievementList(r.data)),
  adminAll: () => api.get("/achievements/admin/all").then((r) => normalizeAchievementList(r.data)),
  create: (p) => api.post("/achievements", p).then((r) => r.data),
  update: (id, p) => api.put(`/achievements/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/achievements/${id}`).then((r) => r.data),
  toggleFeatured: (id) => api.patch(`/achievements/${id}/featured`).then((r) => normalizeAchievement(r.data)),
};
