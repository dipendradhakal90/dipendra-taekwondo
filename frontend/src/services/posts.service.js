import api from "./api";
import { toDisplayImageUrl } from "../utils/imageUrl";

/*
  Assumes backend routes (common patterns):
  GET  /api/posts                 -> public published posts
  GET  /api/posts/admin/all       -> admin all posts
  GET  /api/posts/slug/:slug      -> public single post by slug  (your current)
  (sometimes) GET /api/posts/:slug -> public single post by slug (older)
*/

export const PostsAPI = {
  // public - list published
  listPublished: () =>
    api.get("/posts").then((r) =>
      (Array.isArray(r.data) ? r.data : []).map((post) => ({
        ...post,
        coverImageUrl: toDisplayImageUrl(post?.coverImageUrl),
        coverImage: toDisplayImageUrl(post?.coverImage),
        imageUrl: toDisplayImageUrl(post?.imageUrl),
        thumbnailUrl: toDisplayImageUrl(post?.thumbnailUrl),
        bannerUrl: toDisplayImageUrl(post?.bannerUrl),
        image: toDisplayImageUrl(post?.image),
      }))
    ),

  // public - single by slug (robust: tries main route, then fallback)
  getBySlug: async (slug) => {
    try {
      // ✅ your current route
      const res = await api.get(`/posts/slug/${slug}`);
      return {
        ...res.data,
        coverImageUrl: toDisplayImageUrl(res.data?.coverImageUrl),
        coverImage: toDisplayImageUrl(res.data?.coverImage),
        imageUrl: toDisplayImageUrl(res.data?.imageUrl),
        thumbnailUrl: toDisplayImageUrl(res.data?.thumbnailUrl),
        bannerUrl: toDisplayImageUrl(res.data?.bannerUrl),
        image: toDisplayImageUrl(res.data?.image),
      };
    } catch (err) {
      // ✅ fallback support (if backend uses /posts/:slug)
      const res2 = await api.get(`/posts/${slug}`);
      return {
        ...res2.data,
        coverImageUrl: toDisplayImageUrl(res2.data?.coverImageUrl),
        coverImage: toDisplayImageUrl(res2.data?.coverImage),
        imageUrl: toDisplayImageUrl(res2.data?.imageUrl),
        thumbnailUrl: toDisplayImageUrl(res2.data?.thumbnailUrl),
        bannerUrl: toDisplayImageUrl(res2.data?.bannerUrl),
        image: toDisplayImageUrl(res2.data?.image),
      };
    }
  },

  // admin - all posts
  adminAll: () =>
    api.get("/posts/admin/all").then((r) =>
      (Array.isArray(r.data) ? r.data : []).map((post) => ({
        ...post,
        coverImageUrl: toDisplayImageUrl(post?.coverImageUrl),
        coverImage: toDisplayImageUrl(post?.coverImage),
        imageUrl: toDisplayImageUrl(post?.imageUrl),
        thumbnailUrl: toDisplayImageUrl(post?.thumbnailUrl),
        bannerUrl: toDisplayImageUrl(post?.bannerUrl),
        image: toDisplayImageUrl(post?.image),
      }))
    ),

  // admin - create
  create: (payload) => api.post("/posts", payload).then((r) => r.data),

  // admin - update
  update: (id, payload) => api.put(`/posts/${id}`, payload).then((r) => r.data),

  // admin - delete
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
};
