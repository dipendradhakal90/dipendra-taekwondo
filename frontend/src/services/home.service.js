import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

function normalizeFeaturedGallery(list) {
  if (!Array.isArray(list)) return list;
  return list.map((item) => ({
    ...item,
    imageUrl: toDisplayImageUrl(item?.imageUrl),
  }));
}

export const HomeAPI = {
  featured: () =>
    api.get("/home/featured").then((r) => ({
      ...r.data,
      gallery: normalizeFeaturedGallery(r.data?.gallery),
      galleries: normalizeFeaturedGallery(r.data?.galleries),
      galleryItems: normalizeFeaturedGallery(r.data?.galleryItems),
    })),
};
