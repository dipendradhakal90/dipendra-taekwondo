import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { CertificationsAPI } from "../../services/certifications.service";
import { AwardsAPI } from "../../services/awards.service";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { toDisplayImageUrl } from "../../utils/imageUrl";

export default function Certifications() {
  const { isDark } = useDarkMode();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-certs"], queryFn: CertificationsAPI.adminAll });

  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState(""); // yyyy-mm-dd
  const [credentialId, setCredentialId] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const navigate = useNavigate();

  const items = useMemo(() => q.data || [], [q.data]);

  // ====== Awards admin (merged) ======
  const awardsQ = useQuery({ queryKey: ["admin-awards"], queryFn: AwardsAPI.adminAll });

  const [awardEditing, setAwardEditing] = useState(null);
  const [awardTitle, setAwardTitle] = useState("");
  const [awardIssuer, setAwardIssuer] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [awardImageUrl, setAwardImageUrl] = useState("");
  const [awardDescription, setAwardDescription] = useState("");
  const [awardPublished, setAwardPublished] = useState(true);

  const createAwardM = useMutation({
    mutationFn: AwardsAPI.create,
    onSuccess: () => {
      toast.success("Award created");
      qc.invalidateQueries({ queryKey: ["admin-awards"] });
      qc.invalidateQueries({ queryKey: ["home-awards"] });
      setAwardEditing(null);
      setAwardTitle("");
      setAwardIssuer("");
      setAwardDate("");
      setAwardImageUrl("");
      setAwardDescription("");
      setAwardPublished(true);
    },
  });

  const updateAwardM = useMutation({ mutationFn: ({ id, payload }) => AwardsAPI.update(id, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-awards"] }); qc.invalidateQueries({ queryKey: ["home-awards"] }); toast.success("Award updated"); } });

  const deleteAwardM = useMutation({ mutationFn: AwardsAPI.remove, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-awards"] }); qc.invalidateQueries({ queryKey: ["home-awards"] }); toast.success("Deleted"); } });

  const reset = () => {
    setEditing(null);
    setTitle("");
    setIssuer("");
    setIssueDate("");
    setCredentialId("");
    setCredentialUrl("");
    setDescription("");
    setIsPublished(true);
  };

  const createM = useMutation({
    mutationFn: CertificationsAPI.create,
    onSuccess: () => {
      toast.success("Certification created");
      qc.invalidateQueries({ queryKey: ["admin-certs"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
      reset();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => CertificationsAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-certs"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
      reset();
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: CertificationsAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-certs"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  // ⭐ Featured toggle mutation (admin)
  const featureM = useMutation({
    mutationFn: CertificationsAPI.toggleFeatured,
    onSuccess: () => {
      toast.success("Featured updated");
      qc.invalidateQueries({ queryKey: ["admin-certs"] });
      qc.invalidateQueries({ queryKey: ["home-featured"] });
    },
    onError: () => toast.error("Failed to update featured"),
  });

  if (q.isLoading) return <LoaderFull label="Loading certifications..." />;

  function startEdit(x) {
    setEditing(x);
    setTitle(x.title || "");
    setIssuer(x.issuer || "");
    setIssueDate(x.issueDate ? new Date(x.issueDate).toISOString().slice(0, 10) : "");
    setCredentialId(x.credentialId || "");
    setCredentialUrl(x.credentialUrl || "");
    setDescription(x.description || "");
    setIsPublished(!!x.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!title.trim() || !issueDate) return toast.error("Title and issue date required");

    const payload = { title, issuer, issueDate, credentialId, credentialUrl, description, isPublished };
    if (editing) updateM.mutate({ id: editing._id, payload });
    else createM.mutate(payload);
  }

  function looksLikeImageUrl(value) {
    if (!value || typeof value !== "string") return false;
    const lowered = value.toLowerCase();
    const raw = lowered.split("?")[0].split("#")[0];
    if (/\.(jpg|jpeg|png|webp|gif|bmp|svg|avif)$/.test(raw)) return true;
    if (lowered.includes("drive.google.com/thumbnail")) return true;
    if (lowered.includes("googleusercontent.com")) return true;
    if (raw.includes("/image/upload/")) return true;
    return false;
  }

  function getCertImageUrl(item) {
    if (item?.imageUrl) return toDisplayImageUrl(item.imageUrl);
    if (looksLikeImageUrl(item?.credentialUrl)) return toDisplayImageUrl(item.credentialUrl);
    return "";
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Manage Certifications<span className="text-brand-500">.</span>
          </h2>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
          </div>
        </div>

        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Certification" : "Add Certification"}</div>
            {editing ? (
              <button className="text-sm font-semibold text-black/60 hover:text-black" onClick={reset}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Issuer (WTF/ATF/etc.)"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Credential ID (optional)"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
              />
            </div>

            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Credential URL (PDF/Image link)"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
            />

            <textarea
              className="min-h-[120px] rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm text-black/70 flex items-center gap-2">
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                Publish
              </label>

              <Button className="bg-brand-500" onClick={submit} disabled={createM.isPending || updateM.isPending}>
                {editing ? (updateM.isPending ? "Saving..." : "Save") : (createM.isPending ? "Adding..." : "Add")}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-3">
          {items.map((x) => (
            <Card key={x._id} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                <div className="flex items-start gap-4 min-w-0">
                  <div className={isDark ? "h-20 w-28 rounded-xl overflow-hidden border border-white/10 bg-slate-800 shrink-0" : "h-20 w-28 rounded-xl overflow-hidden border border-black/10 bg-black/5 shrink-0"}>
                    {getCertImageUrl(x) ? (
                      <img src={getCertImageUrl(x)} alt={x.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className={isDark ? "h-full w-full grid place-items-center text-[11px] font-semibold text-white/45" : "h-full w-full grid place-items-center text-[11px] font-semibold text-black/45"}>
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold">{x.title}</div>

                    <span
                      className={
                        "text-xs px-2 py-1 rounded-full border " +
                        (x.isPublished
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700")
                      }
                    >
                      {x.isPublished ? "Published" : "Draft"}
                    </span>

                    {x.isFeatured && (
                      <div className={isDark ? "inline-flex items-center gap-2 text-xs font-semibold bg-yellow-500 text-white px-2 py-1 rounded-lg" : "inline-flex items-center gap-2 text-xs font-semibold bg-yellow-500 text-black px-2 py-1 rounded-lg"}>
                        ⭐ Featured
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-black/60 mt-1">
                    {x.issuer ? `${x.issuer} • ` : ""}
                    {new Date(x.issueDate).toDateString()}
                  </div>

                  {x.credentialUrl ? (
                    <a
                      className="text-sm font-semibold text-brand-600 hover:underline"
                      href={x.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View credential
                    </a>
                  ) : null}
                </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  <Button
                    className={x.isFeatured ? "bg-yellow-500" : ""}
                    onClick={() => featureM.mutate(x._id)}
                    disabled={featureM.isPending}
                  >
                    {x.isFeatured ? "Unfeature" : "Set Featured"}
                  </Button>

                  <Button onClick={() => startEdit(x)}>Edit</Button>
                  <Button className={isDark ? "bg-white/5 text-white" : "bg-black text-white"} onClick={() => deleteM.mutate(x._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {items.length === 0 ? (
            <Card className="p-6">
              <div className="font-semibold">No certifications yet</div>
              <div className="text-sm text-black/60">Add certificates from above.</div>
            </Card>
          ) : null}
        </div>
        
        {/* ===== Awards Management (merged) ===== */}
        <div className="mt-8">
          <h3 className="text-2xl font-extrabold">Manage Awards</h3>

          <Card className="p-5 mt-4">
            <div className="font-bold mb-3">{awardEditing ? "Edit Award" : "Add Award"}</div>
            <div className="grid gap-3">
              <input placeholder="Title" value={awardTitle} onChange={(e) => setAwardTitle(e.target.value)} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input placeholder="Issuer" value={awardIssuer} onChange={(e) => setAwardIssuer(e.target.value)} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input type="date" value={awardDate} onChange={(e) => setAwardDate(e.target.value)} className="rounded-2xl border border-black/10 px-4 py-3" />
              <input placeholder="Image URL" value={awardImageUrl} onChange={(e) => setAwardImageUrl(e.target.value)} className="rounded-2xl border border-black/10 px-4 py-3" />
              <textarea placeholder="Description" value={awardDescription} onChange={(e) => setAwardDescription(e.target.value)} className="min-h-[100px] rounded-2xl border border-black/10 px-4 py-3" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={awardPublished} onChange={(e) => setAwardPublished(e.target.checked)} /> Publish</label>
              <div className="flex gap-2 flex-wrap">
                <Button className="bg-brand-500" onClick={() => {
                  if (!awardTitle.trim() || !awardDate) return toast.error("Title and date required");
                  const payload = { title: awardTitle, issuer: awardIssuer, awardDate, imageUrl: awardImageUrl, description: awardDescription, isPublished: awardPublished };
                  if (awardEditing) updateAwardM.mutate({ id: awardEditing._id, payload });
                  else createAwardM.mutate(payload);
                }}>{awardEditing ? (updateAwardM.isLoading ? "Saving..." : "Save") : (createAwardM.isLoading ? "Creating..." : "Add Award")}</Button>
                {awardEditing && <Button onClick={() => { setAwardEditing(null); setAwardTitle(""); setAwardIssuer(""); setAwardDate(""); setAwardImageUrl(""); setAwardDescription(""); setAwardPublished(true); }}>Cancel</Button>}
              </div>
            </div>
          </Card>

          <div className="mt-4 grid gap-3">
            {awardsQ.isLoading ? <Card className="p-6">Loading awards...</Card> : (awardsQ.data || []).map((a) => (
              <Card key={a._id} className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={isDark ? "h-20 w-28 rounded-xl overflow-hidden border border-white/10 bg-slate-800 shrink-0" : "h-20 w-28 rounded-xl overflow-hidden border border-black/10 bg-black/5 shrink-0"}>
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className={isDark ? "h-full w-full grid place-items-center text-[11px] font-semibold text-white/45" : "h-full w-full grid place-items-center text-[11px] font-semibold text-black/45"}>
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm text-black/60">{a.issuer} • {new Date(a.awardDate).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => { setAwardEditing(a); setAwardTitle(a.title || ""); setAwardIssuer(a.issuer || ""); setAwardDate(a.awardDate ? new Date(a.awardDate).toISOString().slice(0,10) : ""); setAwardImageUrl(a.imageUrl || ""); setAwardDescription(a.description || ""); setAwardPublished(!!a.isPublished); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
                    <Button className="bg-black" onClick={() => deleteAwardM.mutate(a._id)}>Delete</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
