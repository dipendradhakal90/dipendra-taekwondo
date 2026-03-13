import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { AwardsAPI } from "../../services/awards.service";
import { useNavigate } from "react-router-dom";

export default function AwardsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-awards"], queryFn: AwardsAPI.adminAll });
  const navigate = useNavigate();

  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const items = useMemo(() => q.data || [], [q.data]);

  const reset = () => {
    setEditing(null);
    setTitle("");
    setIssuer("");
    setAwardDate("");
    setImageUrl("");
    setDescription("");
    setIsPublished(true);
  };

  const createM = useMutation({
    mutationFn: AwardsAPI.create,
    onSuccess: () => {
      toast.success("Award created");
      qc.invalidateQueries({ queryKey: ["admin-awards"] });
      qc.invalidateQueries({ queryKey: ["home-awards"] });
      reset();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => AwardsAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Award updated");
      qc.invalidateQueries({ queryKey: ["admin-awards"] });
      qc.invalidateQueries({ queryKey: ["home-awards"] });
      reset();
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: AwardsAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-awards"] });
      qc.invalidateQueries({ queryKey: ["home-awards"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const featureM = useMutation({
    mutationFn: AwardsAPI.toggleFeatured,
    onSuccess: () => {
      toast.success("Featured updated");
      qc.invalidateQueries({ queryKey: ["admin-awards"] });
      qc.invalidateQueries({ queryKey: ["home-awards"] });
    },
    onError: () => toast.error("Failed to update featured"),
  });

  if (q.isLoading) return <LoaderFull label="Loading awards..." />;

  function startEdit(x) {
    setEditing(x);
    setTitle(x.title || "");
    setIssuer(x.issuer || "");
    setAwardDate(x.awardDate ? new Date(x.awardDate).toISOString().slice(0, 10) : "");
    setImageUrl(x.imageUrl || "");
    setDescription(x.description || "");
    setIsPublished(!!x.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!title.trim() || !awardDate) 
      return toast.error("Title and date required");

    const payload = { 
      title, 
      issuer, 
      awardDate,
      imageUrl, 
      description,
      isPublished 
    };

    if (editing) updateM.mutate({ id: editing._id, payload });
    else createM.mutate(payload);
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            Manage Awards<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
        </div>

        {/* Editor */}
        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Award" : "Add Award"}</div>
            {editing ? (
              <button 
                className="text-sm font-semibold text-black/60 hover:text-black" 
                onClick={reset}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Award Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                type="date"
                value={awardDate}
                onChange={(e) => setAwardDate(e.target.value)}
              />
            </div>

            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Issuer (e.g., Nepal Olympic Committee)"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            />

            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Certificate/Award Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <textarea
              className="min-h-[100px] rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="text-sm text-black/70 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish
            </label>

            <Button 
              className="bg-brand-500" 
              onClick={submit} 
              disabled={createM.isPending || updateM.isPending}
            >
              {editing ? (updateM.isPending ? "Saving..." : "Save") : (createM.isPending ? "Creating..." : "Add Award")}
            </Button>
          </div>
        </Card>

        {/* List */}
        <Card className="p-5 mt-6">
          <div className="font-bold mb-4">Awards ({items.length})</div>
          {items.length === 0 ? (
            <div className="text-black/60">No awards added yet.</div>
          ) : (
            <div className="grid gap-3">
              {items.map((award) => (
                <div key={award._id} className="border border-black/10 p-4 rounded-2xl flex items-start justify-between gap-4 hover:bg-black/[0.02] transition">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-28 h-20 rounded-xl overflow-hidden border border-black/10 bg-black/5 shrink-0">
                      {award.imageUrl ? (
                        <img
                          src={award.imageUrl}
                          alt={award.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[11px] font-semibold text-black/45">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{award.title}</div>
                      <div className="text-sm text-black/60">{award.issuer || "—"}</div>
                      <div className="text-xs text-black/50 mt-1">
                        {new Date(award.awardDate).toLocaleDateString()}
                      </div>
                      {award.isFeatured && (
                        <div className="inline-block mt-2 text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          ⭐ Featured
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => featureM.mutate(award._id)}
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        award.isFeatured 
                          ? "bg-yellow-100 text-yellow-700" 
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {award.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                    <button
                      onClick={() => startEdit(award)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteM.mutate(award._id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
