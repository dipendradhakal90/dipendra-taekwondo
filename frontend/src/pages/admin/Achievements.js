import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { AchievementsAPI } from "../../services/achievements.service";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AchievementsAdmin() {
  const { isDark } = useDarkMode();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-achievements"], queryFn: AchievementsAPI.adminAll });

  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [date, setDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("Coach");
  const [level, setLevel] = useState("International");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const navigate = useNavigate();

  const reset = () => {
    setEditing(null);
    setTitle("");
    setSummary("");
    setImageUrl("");
    setDate("");
    setOrganization("");
    setLocation("");
    setRole("Coach");
    setLevel("International");
    setDescription("");
    setIsPublished(true);
  };

  const createM = useMutation({
    mutationFn: AchievementsAPI.create,
    onSuccess: () => {
      toast.success("Achievement created");
      qc.invalidateQueries({ queryKey: ["admin-achievements"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
      reset();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => AchievementsAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Achievement updated");
      qc.invalidateQueries({ queryKey: ["admin-achievements"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
      reset();
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: AchievementsAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-achievements"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  const featureM = useMutation({
    mutationFn: AchievementsAPI.toggleFeatured,
    onSuccess: () => {
      toast.success("Featured updated");
      qc.invalidateQueries({ queryKey: ["admin-achievements"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
    },
    onError: () => toast.error("Failed to update featured"),
  });

  const items = useMemo(() => q.data || [], [q.data]);

  if (q.isLoading) return <LoaderFull label="Loading achievements..." />;

  function startEdit(x) {
    setEditing(x);
    setTitle(x.title || "");
    setSummary(x.summary || "");
    setImageUrl(x.imageUrl || "");
    setDate(x.date ? new Date(x.date).toISOString().slice(0, 10) : "");
    setOrganization(x.organization || "");
    setLocation(x.location || "");
    setRole(x.role || "Coach");
    setLevel(x.level || "International");
    setDescription(x.description || "");
    setIsPublished(!!x.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!title.trim() || !date) return toast.error("Title and date required");
    const payload = { title, summary, imageUrl, date, organization, location, role, level, description, isPublished };
    if (editing) updateM.mutate({ id: editing._id, payload });
    else createM.mutate(payload);
  }

  return (
    <div className={cx("min-h-screen p-4 sm:p-6", isDark ? "bg-slate-950 text-white" : "bg-white text-black")}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Manage Achievements<span className="text-brand-500">.</span>
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
          </div>
        </div>

        <Card className={cx("p-5 mt-6", isDark ? "bg-slate-900 border-white/10" : "") }>
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Achievement" : "Create Achievement"}</div>
            {editing ? (
              <button className={cx("text-sm font-semibold", isDark ? "text-white/70 hover:text-white" : "text-black/60 hover:text-black")} onClick={reset}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Achievement Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Image URL (required for card image box)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

            <textarea className={cx("min-h-[84px] rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Short summary (shown on card)" value={summary} onChange={(e) => setSummary(e.target.value)} />

            <div className="grid md:grid-cols-2 gap-3">
              <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Organization (WT/ATF...)" value={organization} onChange={(e) => setOrganization(e.target.value)} />
              <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Role (Coach/Referee/Judge...)" value={role} onChange={(e) => setRole(e.target.value)} />
              <select className={cx("rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>International</option>
                <option>National</option>
                <option>State</option>
                <option>District</option>
              </select>
            </div>

            <textarea className={cx("min-h-[140px] rounded-2xl border px-4 py-3", isDark ? "bg-slate-800 border-white/15" : "border-black/10")} placeholder="Detailed description (for Details overlay)" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex items-center justify-between">
              <label className={cx("text-sm flex items-center gap-2", isDark ? "text-white/70" : "text-black/70")}>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                Publish (uncheck to save draft)
              </label>

              <Button className="bg-brand-500" onClick={submit} disabled={createM.isPending || updateM.isPending}>
                {editing ? (updateM.isPending ? "Saving..." : "Save") : createM.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3">
          {items.map((x) => (
            <Card key={x._id} className={cx("p-4", isDark ? "bg-slate-900 border-white/10" : "") }>
              <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="flex items-start gap-4 min-w-0">
                  <div className={cx("h-20 w-28 rounded-xl overflow-hidden border shrink-0", isDark ? "border-white/10 bg-slate-800" : "border-black/10 bg-black/5")}>
                    {x.imageUrl ? (
                      <img src={x.imageUrl} alt={x.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className={cx("h-full w-full grid place-items-center text-[11px] font-semibold", isDark ? "text-white/45" : "text-black/45")}>No image</div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold line-clamp-2">{x.title}</div>

                      <span className={"text-xs px-2 py-1 rounded-full border " + (x.isPublished ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700")}>
                        {x.isPublished ? "Published" : "Draft"}
                      </span>

                      {x.isFeatured && (
                        <div className={isDark ? "inline-flex items-center gap-2 text-xs font-semibold bg-yellow-500 text-white px-2 py-1 rounded-lg" : "inline-flex items-center gap-2 text-xs font-semibold bg-yellow-500 text-black px-2 py-1 rounded-lg"}>
                          Featured
                        </div>
                      )}
                    </div>

                    <div className={cx("text-sm mt-1", isDark ? "text-white/65" : "text-black/60")}>
                      {new Date(x.date).toDateString()} • {x.level} • {x.role}
                      {x.location ? ` • ${x.location}` : ""}
                    </div>

                    {x.summary ? <div className={cx("text-sm mt-1 line-clamp-2", isDark ? "text-white/55" : "text-black/55")}>{x.summary}</div> : null}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <Button className={x.isFeatured ? "bg-yellow-500" : ""} onClick={() => featureM.mutate(x._id)} disabled={featureM.isPending}>
                    {x.isFeatured ? "Unfeature" : "Set Featured"}
                  </Button>

                  <Button onClick={() => startEdit(x)}>Edit</Button>
                  <Button className={isDark ? "bg-white/10 text-white" : "bg-black text-white"} onClick={() => deleteM.mutate(x._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {items.length === 0 ? (
            <Card className={cx("p-6", isDark ? "bg-slate-900 border-white/10" : "") }>
              <div className="font-semibold">No achievements yet</div>
              <div className={cx("text-sm", isDark ? "text-white/60" : "text-black/60")}>Add your first achievement above.</div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}



