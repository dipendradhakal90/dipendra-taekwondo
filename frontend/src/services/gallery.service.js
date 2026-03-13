import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeGalleryItem(item) {
  if (!item) return item;
  return {
    ...item,
    rawImageUrl: item.imageUrl,
    imageUrl: toDisplayImageUrl(item.imageUrl),
  };
}

function normalizeGalleryList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeGalleryItem);
}

export const GalleryAPI = {
  list: () => api.get("/gallery").then((r) => normalizeGalleryList(r.data)),

  adminAll: () => api.get("/gallery/admin/all").then((r) => normalizeGalleryList(r.data)),

  create: (payload) => api.post("/gallery/admin", payload).then((r) => normalizeGalleryItem(r.data)),

  update: (id, payload) => api.put(`/gallery/${id}`, payload).then((r) => normalizeGalleryItem(r.data)),

  upload: (formData) =>
    api.post("/gallery/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => normalizeGalleryItem(r.data)),

  remove: (id) => api.delete(`/gallery/${id}`).then((r) => r.data),

  // ⭐ Featured toggle
  toggleFeatured: (id) =>
    api.patch(`/gallery/${id}/featured`).then((r) => r.data),
};
