import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeCert(item) {
  if (!item) return item;
  return {
    ...item,
    imageUrl: toDisplayImageUrl(item.imageUrl),
  };
}

function normalizeCertList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCert);
}

export const CertificationsAPI = {
  list: () => api.get("/certifications").then((r) => normalizeCertList(r.data)),
  adminAll: () => api.get("/certifications/admin/all").then((r) => normalizeCertList(r.data)),
  create: (p) => api.post("/certifications", p).then((r) => r.data),
  update: (id, p) => api.put(`/certifications/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/certifications/${id}`).then((r) => r.data),
  toggleFeatured: (id) => api.patch(`/certifications/${id}/featured`).then((r) => normalizeCert(r.data)),

};
