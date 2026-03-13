import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { GalleryAPI } from "../../services/gallery.service";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { normalizeImageUrl } from "../../utils/imageUrl";

export default function GalleryAdmin() {
  const { isDark } = useDarkMode();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-gallery"], queryFn: GalleryAPI.adminAll });

  const [editingId, setEditingId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("General");
  const [isPublished, setIsPublished] = useState(true);
  const navigate = useNavigate();
  const normalizedImageUrl = normalizeImageUrl(imageUrl);

  function resetForm() {
    setEditingId("");
    setImageUrl("");
    setTitle("");
    setAlbum("General");
    setIsPublished(true);
  }

  function startEdit(item) {
    setEditingId(item._id);
    setImageUrl(item.rawImageUrl || item.imageUrl || "");
    setTitle(item.title || "");
    setAlbum(item.album || "General");
    setIsPublished(!!item.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const createM = useMutation({
    mutationFn: GalleryAPI.create,
    onSuccess: () => {
      toast.success("Gallery image added");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Save failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => GalleryAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Gallery image updated");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
      resetForm();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: GalleryAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  // ⭐ Featured toggle mutation
  const featureM = useMutation({
    mutationFn: GalleryAPI.toggleFeatured,
    onSuccess: () => {
      toast.success("Featured status updated");
      qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    },
    onError: () => toast.error("Failed to update featured"),
  });

  if (q.isLoading) return <LoaderFull label="Loading gallery..." />;

  function submit() {
    if (!normalizedImageUrl) return toast.error("Image URL required");
    const payload = { imageUrl: normalizedImageUrl, title, album, isPublished };
    if (editingId) {
      updateM.mutate({ id: editingId, payload });
      return;
    }
    createM.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">
            Gallery CMS<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </Button>
        </div>

        {/* Upload Card */}
        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold">{editingId ? "Edit Gallery Image" : "Add Image URL"}</div>
            {editingId ? (
              <button className="text-sm font-semibold text-black/70 hover:text-black" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Image URL (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            {normalizedImageUrl ? (
              <img
                src={normalizedImageUrl}
                alt="Preview"
                className="rounded-2xl object-cover h-48 w-full border border-black/10"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : null}

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select
                className="rounded-2xl border border-black/10 px-4 py-3"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
              >
                <option>General</option>
                <option>Events</option>
                <option>Seminars</option>
                <option>Championships</option>
                <option>Training</option>
              </select>
            </div>

            <label className="text-sm text-black/70 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish
            </label>

            <Button className="bg-brand-500" onClick={submit} disabled={createM.isPending || updateM.isPending}>
              {editingId
                ? (updateM.isPending ? "Saving..." : "Save Changes")
                : (createM.isPending ? "Saving..." : "Add Image")}
            </Button>
          </div>
        </Card>

        {/* Gallery Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {q.data.map((x) => (
            <div key={x._id} className="relative group">
              <img
                src={x.imageUrl}
                alt=""
                className="rounded-2xl object-cover h-48 w-full"
              />

              {/* Featured Badge */}
              {x.isFeatured && (
                <div className={isDark ? "absolute top-2 left-2 bg-yellow-500 text-white text-[11px] px-2 py-1 rounded-lg font-semibold shadow" : "absolute top-2 left-2 bg-yellow-500 text-black text-[11px] px-2 py-1 rounded-lg font-semibold shadow"}>
                  ⭐ Featured
                </div>
              )}

              {/* Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end justify-between p-2 rounded-2xl">
                
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => startEdit(x)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg bg-white text-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => featureM.mutate(x._id)}
                    className={
                      "text-xs font-semibold px-2 py-1 rounded-lg " +
                      (x.isFeatured ? "bg-yellow-500 text-white" : "bg-white text-black")
                    }
                  >
                    {x.isFeatured ? "Unfeature" : "Set Featured"}
                  </button>
                  <button
                    onClick={() => deleteM.mutate(x._id)}
                    className="bg-red-600 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
