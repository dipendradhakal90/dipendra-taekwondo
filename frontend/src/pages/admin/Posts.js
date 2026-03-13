import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { useNavigate } from "react-router-dom";
import { normalizeImageUrl, toDisplayImageUrl } from "../../utils/imageUrl";

const PostsAPI = {
  adminAll: () =>
    api.get("/posts/admin/all").then((r) =>
      (Array.isArray(r.data) ? r.data : []).map((p) => ({
        ...p,
        coverImageUrl: toDisplayImageUrl(p.coverImageUrl || p.imageUrl),
      }))
    ),
  create: (p) => api.post("/posts", p).then((r) => r.data),
  update: (id, p) => api.put(`/posts/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
};

export default function Posts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["admin-posts"], queryFn: PostsAPI.adminAll });

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setIsPublished(true);
    setCoverImageUrl("");
  };

  const createM = useMutation({
    mutationFn: PostsAPI.create,
    onSuccess: () => {
      toast.success("Post created");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => PostsAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Post updated");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: PostsAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const items = useMemo(() => q.data || [], [q.data]);
  const normalizedCover = normalizeImageUrl(coverImageUrl);
  const displayCover = toDisplayImageUrl(normalizedCover);

  if (q.isLoading) return <LoaderFull label="Loading CMS..." />;

  function startEdit(p) {
    setEditing(p);
    setTitle(p.title || "");
    setExcerpt(p.excerpt || "");
    setContent(p.content || "");
    setIsPublished(!!p.isPublished);
    setCoverImageUrl(p.coverImageUrl || p.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!title.trim() || !content.trim()) return toast.error("Title & content required");

    const payload = {
      title,
      excerpt,
      content,
      isPublished,
      coverImageUrl: normalizedCover
    };
    if (editing) updateM.mutate({ id: editing._id, payload });
    else createM.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Manage Posts<span className="text-brand-500">.</span>
          </h2>
          <div className="flex gap-2">
            <Button type="button" onClick={() => navigate("/admin/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>

        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Post" : "Create Post"}</div>
            {editing ? (
              <button
                type="button"
                className="text-sm font-semibold text-black/60 hover:text-black"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-black/10 p-4">
              <div className="text-sm font-bold">Post Cover Image URL</div>
              <div className="text-xs text-black/50 mt-1">Optional: paste a direct image URL</div>

              <div className="mt-3">
                <input
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 bg-white"
                  placeholder="https://example.com/post-cover.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              {displayCover ? (
                <div className="mt-4 rounded-2xl overflow-hidden border border-black/10 bg-black/[0.02]">
                  <img
                    src={displayCover}
                    alt="cover preview"
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : null}
            </div>

            <input
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Excerpt (short summary)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <textarea
              className="min-h-[220px] rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Write content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm text-black/70 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Publish (uncheck to save draft)
              </label>

              <Button
                type="button"
                className="bg-brand-500"
                onClick={submit}
                disabled={createM.isPending || updateM.isPending}
              >
                {editing
                  ? updateM.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createM.isPending
                  ? "Creating..."
                  : "Create Post"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3">
          <div className="text-sm text-black/60">
            Total: <span className="font-semibold text-black">{items.length}</span>
          </div>

          {items.map((p) => (
            <Card key={p._id} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-20 w-28 rounded-xl overflow-hidden border border-black/10 bg-black/5 shrink-0">
                    {p.coverImageUrl ? (
                      <img src={p.coverImageUrl} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-[11px] font-semibold text-black/45">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">{p.title}</div>
                    <span
                      className={
                        "text-xs px-2 py-1 rounded-full border " +
                        (p.isPublished
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700")
                      }
                    >
                      {p.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="text-sm text-black/60 mt-1">{p.excerpt || "-"}</div>
                  <div className="text-xs text-black/40 mt-1">/{p.slug}</div>
                </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <Button type="button" onClick={() => startEdit(p)}>Edit</Button>
                  <Button type="button" className="bg-black" onClick={() => deleteM.mutate(p._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {items.length === 0 ? (
            <Card className="p-6">
              <div className="font-semibold">No posts yet</div>
              <div className="text-sm text-black/60">Create your first update from above.</div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
