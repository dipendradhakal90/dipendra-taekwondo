import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeAbout(item) {
  if (!item) return item;
  return {
    ...item,
    imageUrl: toDisplayImageUrl(item.imageUrl),
    profileImageUrl: toDisplayImageUrl(item.profileImageUrl),
  };
}

export const AboutAPI = {
  // public
  getPublic: () => api.get("/about/public").then((r) => normalizeAbout(r.data)),

  // admin
  getAdmin: () => api.get("/about/admin").then((r) => normalizeAbout(r.data)),

  update: (payload) => api.put("/about/admin", payload).then((r) => r.data),
};
