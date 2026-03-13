import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { CountriesAPI } from "../../services/countries.service";
import { useNavigate } from "react-router-dom";

export default function CountriesAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-countries"], queryFn: CountriesAPI.adminAll });
  const navigate = useNavigate();

  const [editing, setEditing] = useState(null);
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [flagUrl, setFlagUrl] = useState("");
  const [flagEmoji, setFlagEmoji] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const items = useMemo(() => q.data || [], [q.data]);

  const reset = () => {
    setEditing(null);
    setCountryName("");
    setCountryCode("");
    setFlagUrl("");
    setFlagEmoji("");
    setVisitDate("");
    setDescription("");
    setIsPublished(true);
  };

  const createM = useMutation({
    mutationFn: CountriesAPI.create,
    onSuccess: () => {
      toast.success("Country added");
      qc.invalidateQueries({ queryKey: ["admin-countries"] });
      qc.invalidateQueries({ queryKey: ["home-countries"] });
      reset();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Create failed"),
  });

  const updateM = useMutation({
    mutationFn: ({ id, payload }) => CountriesAPI.update(id, payload),
    onSuccess: () => {
      toast.success("Country updated");
      qc.invalidateQueries({ queryKey: ["admin-countries"] });
      qc.invalidateQueries({ queryKey: ["home-countries"] });
      reset();
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteM = useMutation({
    mutationFn: CountriesAPI.remove,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-countries"] });
      qc.invalidateQueries({ queryKey: ["home-countries"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  if (q.isLoading) return <LoaderFull label="Loading countries..." />;

  function startEdit(x) {
    setEditing(x);
    setCountryName(x.countryName || "");
    setCountryCode(x.countryCode || "");
    setFlagUrl(x.flagUrl || "");
    setFlagEmoji(x.flagEmoji || "");
    setVisitDate(x.visitDate ? new Date(x.visitDate).toISOString().slice(0, 10) : "");
    setDescription(x.description || "");
    setIsPublished(!!x.isPublished);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!countryName.trim() || !countryCode.trim()) 
      return toast.error("Country name and code required");

    const payload = { 
      countryName, 
      countryCode, 
      flagUrl, 
      flagEmoji, 
      visitDate: visitDate || new Date(),
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
            Manage Countries<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
        </div>

        {/* Editor */}
        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between">
            <div className="font-bold">{editing ? "Edit Country" : "Add Country"}</div>
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
                placeholder="Country Name (e.g., Nepal, Turkey)"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Country Code (e.g., NP, TR)"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                maxLength="2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Flag Emoji (optional)"
                value={flagEmoji}
                onChange={(e) => setFlagEmoji(e.target.value)}
                maxLength="2"
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>

            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Flag URL (SVG/PNG - optional)"
              value={flagUrl}
              onChange={(e) => setFlagUrl(e.target.value)}
            />

            <textarea
              className="min-h-[100px] rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Description (e.g., Asian Games 2023, International Tournament)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="text-sm text-black/70 flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Publish on homepage
            </label>

            <Button 
              className="bg-brand-500" 
              onClick={submit} 
              disabled={createM.isPending || updateM.isPending}
            >
              {editing ? (updateM.isPending ? "Saving..." : "Save") : (createM.isPending ? "Creating..." : "Add Country")}
            </Button>
          </div>
        </Card>

        {/* List */}
        <Card className="p-5 mt-6">
          <div className="font-bold mb-4">Countries ({items.length})</div>
          {items.length === 0 ? (
            <div className="text-black/60">No countries added yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 px-4 font-semibold">Country</th>
                    <th className="text-left py-3 px-4 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Description</th>
                    <th className="text-left py-3 px-4 font-semibold">Published</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((x) => (
                    <tr key={x._id} className="border-b border-black/5 hover:bg-black/2 transition">
                      <td className="py-3 px-4 font-semibold">{x.countryName}</td>
                      <td className="py-3 px-4">{x.countryCode}</td>
                      <td className="py-3 px-4 max-w-xs">{x.description || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${x.isPublished ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {x.isPublished ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => startEdit(x)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteM.mutate(x._id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
