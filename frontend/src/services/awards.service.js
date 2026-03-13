import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeAward(item) {
  if (!item) return item;
  return {
    ...item,
    imageUrl: toDisplayImageUrl(item.imageUrl),
  };
}

function normalizeAwardList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeAward);
}

export const AwardsAPI = {
  list: () => api.get("/awards").then((r) => normalizeAwardList(r.data)),
  adminAll: () => api.get("/awards/admin/all").then((r) => normalizeAwardList(r.data)),
  create: (p) => api.post("/awards", p).then((r) => r.data),
  update: (id, p) => api.put(`/awards/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/awards/${id}`).then((r) => r.data),
  toggleFeatured: (id) => api.patch(`/awards/${id}/featured`).then((r) => normalizeAward(r.data)),
};
