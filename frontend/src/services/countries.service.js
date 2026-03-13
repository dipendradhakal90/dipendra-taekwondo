import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeCountry(item) {
  if (!item) return item;
  return {
    ...item,
    flagUrl: toDisplayImageUrl(item.flagUrl),
  };
}

function normalizeCountryList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCountry);
}

export const CountriesAPI = {
  list: () => api.get("/countries").then((r) => normalizeCountryList(r.data)),
  adminAll: () => api.get("/countries/admin/all").then((r) => normalizeCountryList(r.data)),
  create: (p) => api.post("/countries", p).then((r) => r.data),
  update: (id, p) => api.put(`/countries/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/countries/${id}`).then((r) => r.data),
};
