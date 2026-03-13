import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { MediaCoverageAPI } from "../../services/media-coverage.service";
import { normalizeImageUrl } from "../../utils/imageUrl";

export default function MediaCoverageAdmin() {
  const { isDark } = useDarkMode();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("other");
  const [isPublished, setIsPublished] = useState(true);

  const [coverImageUrl, setCoverImageUrl] = useState("");
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["admin-media-coverage"], queryFn: MediaCoverageAPI.adminAll });

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setType("other");
    setIsPublished(true);
    setCoverImageUrl("");
  };

  const createM = useMutation({
    mutationFn: MediaCoverageAPI.create,
    onSuccess: () => {
      toast.success("Media coverage added");
      qc.invalidateQueries({ queryKey: ["admin-media-coverage"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => MediaCoverageAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Media coverage updated");
      qc.invalidateQueries({ queryKey: ["admin-media-coverage"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: MediaCoverageAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-media-coverage"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const items = useMemo(() => q.data || [], [q.data]);
  const normalizedCover = normalizeImageUrl(coverImageUrl);

  if (q.isLoading) return <LoaderFull label="Loading Media Coverage..." />;

  function startEdit(item) {
    setEditing(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setUrl(item.url || "");
    setType(item.type || "other");
    setIsPublished(!!item.isPublished);
    setCoverImageUrl(item.coverImageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!title.trim() || !url.trim()) return toast.error("Title & URL required");

    const payload = {
      title,
      description,
      url,
      type,
      isPublished,
      coverImageUrl: normalizedCover
    };

    if (editing) updateM.mutate({ id: editing._id, payload });
    else createM.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            Media Coverage CMS<span className="text-brand-500">.</span>
          </h2>
          <div className="flex gap-2">
            <Button type="button" onClick={() => navigate("/admin/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>

        {/* Editor */}
        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Media Coverage" : "Add Media Coverage"}</div>
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
            {/* Cover image URL */}
            <div className="rounded-2xl border border-black/10 p-4">
              <div className="text-sm font-bold">Cover Image</div>
              <div className="text-xs text-black/50 mt-1">Optional: Paste a direct image URL</div>

              <div className="mt-3">
                <input
                  className={isDark ? "w-full rounded-2xl border border-white/10 px-4 py-3 bg-slate-700/30" : "w-full rounded-2xl border border-black/10 px-4 py-3 bg-white"}
                  placeholder="https://example.com/image.jpg"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>

              {normalizedCover ? (
                <div className="mt-4 rounded-2xl overflow-hidden border border-black/10 bg-black/[0.02]">
                  <img
                    src={normalizedCover}
                    alt="cover preview"
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : null}

              {coverImageUrl ? (
                <div className="mt-3 text-xs text-black/50 break-all">
                  Saved URL: <span className="text-black/70 font-semibold">{coverImageUrl}</span>
                </div>
              ) : null}
            </div>

            <input
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Title (e.g., Article from Times News)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="URL (e.g., https://example.com/article)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <textarea
              className="min-h-[100px] rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="other">Type - Other</option>
              <option value="newspaper">Newspaper</option>
              <option value="video">Video</option>
              <option value="magazine">Magazine</option>
              <option value="news-portal">News Portal</option>
            </select>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 rounded accent-black"
              />
              <span className="text-sm font-medium">Published</span>
            </label>

            <Button
              type="button"
              onClick={submit}
              className={isDark ? "bg-white/5 text-white w-full" : "bg-black text-white w-full"}
              disabled={createM.isPending || updateM.isPending}
            >
              {createM.isPending || updateM.isPending
                ? "Saving..."
                : editing
                ? "Update Media Coverage"
                : "Add Media Coverage"}
            </Button>
          </div>
        </Card>

        {/* List */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">
            Media Coverage ({items.length})
          </h3>

          <div className="grid gap-3">
            {items.length === 0 ? (
              <Card className="p-6 text-center text-black/50">No media coverage yet</Card>
            ) : (
              items.map((item) => (
                <Card
                  key={item._id}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-black truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-black/50 mt-1 truncate">
                      {item.url}
                    </div>
                    <div className="text-xs text-black/40 mt-1">
                      Type: {item.type} • {item.isPublished ? "Published" : "Draft"}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      type="button"
                      className="px-3 py-2 text-xs"
                      onClick={() => startEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      className={isDark ? "px-3 py-2 text-xs bg-red-500 text-white" : "px-3 py-2 text-xs bg-red-500 text-white"}
                      onClick={() => {
                        if (window.confirm("Delete this media coverage?"))
                          deleteM.mutate(item._id);
                      }}
                      disabled={deleteM.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
