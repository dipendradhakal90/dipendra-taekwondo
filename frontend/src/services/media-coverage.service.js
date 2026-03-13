import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeMedia(item) {
  if (!item) return item;
  return {
    ...item,
    coverImageUrl: toDisplayImageUrl(item.coverImageUrl),
  };
}

function normalizeMediaList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeMedia);
}

export const MediaCoverageAPI = {
  // public - list published
  listPublished: () => api.get("/media-coverage").then((r) => normalizeMediaList(r.data)),

  // public - get latest
  getLatest: (limit = 5) =>
    api.get("/media-coverage/latest", { params: { limit } }).then((r) => normalizeMediaList(r.data)),

  // admin - all media coverage
  adminAll: () => api.get("/media-coverage/admin/all").then((r) => normalizeMediaList(r.data)),

  // admin - create
  create: (payload) => api.post("/media-coverage", payload).then((r) => r.data),

  // admin - update
  update: (id, payload) => api.put(`/media-coverage/${id}`, payload).then((r) => r.data),

  // admin - delete
  remove: (id) => api.delete(`/media-coverage/${id}`).then((r) => r.data),
};
