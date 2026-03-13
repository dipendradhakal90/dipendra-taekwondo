import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoaderFull from "../../components/common/LoaderFull";
import { AboutAPI } from "../../services/about.service";
import { useNavigate } from "react-router-dom";

export default function AdminAbout() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["admin-about"],
    queryFn: AboutAPI.getAdmin,
  });

  const data = useMemo(() => q.data || null, [q.data]);

  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [stats, setStats] = useState([{ label: "", value: "" }]);
  const [ctaPrimaryText, setCtaPrimaryText] = useState("Contact");
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState("/contact");
  const [ctaSecondaryText, setCtaSecondaryText] = useState("View Certifications");
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState("/certifications");
  const [profileStatusTitle, setProfileStatusTitle] = useState("PROFESSIONAL STATUS");
  const [profileStatusItemsText, setProfileStatusItemsText] = useState("");
  const [taekwondoTrainingsTitle, setTaekwondoTrainingsTitle] = useState("TAEKWONDO TRAININGS");
  const [taekwondoTrainingsItemsText, setTaekwondoTrainingsItemsText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    if (!data) return;

    setHeading(data.heading || "About");
    setSubheading(data.subheading || "");
    setBio(data.bio || "");
    setImageUrl(data.imageUrl || "");

    setHighlightsText((data.highlights || []).join("\n"));

    setStats(
      (data.stats && data.stats.length ? data.stats : [{ label: "", value: "" }]).map((s) => ({
        label: s.label || "",
        value: s.value || "",
      }))
    );

    setCtaPrimaryText(data.ctaPrimaryText || "Contact");
    setCtaPrimaryLink(data.ctaPrimaryLink || "/contact");
    setCtaSecondaryText(data.ctaSecondaryText || "View Certifications");
    setCtaSecondaryLink(data.ctaSecondaryLink || "/certifications");
    setProfileStatusTitle(data.profileStatusTitle || "PROFESSIONAL STATUS");
    setProfileStatusItemsText((data.profileStatusItems || []).join("\n"));
    setTaekwondoTrainingsTitle(data.taekwondoTrainingsTitle || "TAEKWONDO TRAININGS");
    setTaekwondoTrainingsItemsText((data.taekwondoTrainingsItems || []).join("\n"));
    setIsPublished(!!data.isPublished);
  }, [data]);

  const updateM = useMutation({
    mutationFn: AboutAPI.update,
    onSuccess: () => {
      toast.success("About updated");
      qc.invalidateQueries({ queryKey: ["admin-about"] });
      qc.invalidateQueries({ queryKey: ["about-public"] });
      qc.invalidateQueries({ queryKey: ["home-about"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  if (q.isLoading) return <LoaderFull label="Loading About..." />;

  const cleanStats = stats
    .map((s) => ({ label: (s.label || "").trim(), value: (s.value || "").trim() }))
    .filter((s) => s.label && s.value);

  const highlights = highlightsText
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const profileStatusItems = profileStatusItemsText
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  const taekwondoTrainingsItems = taekwondoTrainingsItemsText
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  const submit = () => {
    const payload = {
      heading,
      subheading,
      bio,
      imageUrl,
      highlights,
      stats: cleanStats,
      ctaPrimaryText,
      ctaPrimaryLink,
      ctaSecondaryText,
      ctaSecondaryLink,
      profileStatusTitle,
      profileStatusItems,
      taekwondoTrainingsTitle,
      taekwondoTrainingsItems,
      isPublished,
    };
    updateM.mutate(payload);
  };

  const updateStat = (idx, key, value) => {
    setStats((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };

  const addStat = () => setStats((prev) => [...prev, { label: "", value: "" }]);
  const removeStat = (idx) => setStats((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            Manage About<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
        </div>

        <Card className="p-5 mt-6">
          <div className="grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Heading (e.g. About)"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Subheading"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
              />
            </div>

            <textarea
              className="min-h-[160px] rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Bio / About text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Image URL (About section)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <textarea
              className="min-h-[140px] rounded-2xl border border-black/10 px-4 py-3"
              placeholder={"Highlights (one per line)\n- Officiated ...\n- Certified ..."}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
            />

            <div className="rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">Stats</div>
                <Button onClick={addStat}>Add Stat</Button>
              </div>

              <div className="mt-3 grid gap-3">
                {stats.map((s, idx) => (
                  <div key={idx} className="grid md:grid-cols-[1fr_160px_110px] gap-3">
                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="Label (e.g. Matches Officiated)"
                      value={s.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                    />
                    <input
                      className="rounded-2xl border border-black/10 px-4 py-3"
                      placeholder="Value (e.g. 300+)"
                      value={s.value}
                      onChange={(e) => updateStat(idx, "value", e.target.value)}
                    />
                    <Button className="bg-black" onClick={() => removeStat(idx)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Primary CTA Text"
                value={ctaPrimaryText}
                onChange={(e) => setCtaPrimaryText(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Primary CTA Link"
                value={ctaPrimaryLink}
                onChange={(e) => setCtaPrimaryLink(e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Secondary CTA Text"
                value={ctaSecondaryText}
                onChange={(e) => setCtaSecondaryText(e.target.value)}
              />
              <input
                className="rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Secondary CTA Link"
                value={ctaSecondaryLink}
                onChange={(e) => setCtaSecondaryLink(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-black/10 p-4 grid gap-3">
              <div className="font-bold">About Detail Columns (About Page)</div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3"
                  placeholder="Left Column Title"
                  value={profileStatusTitle}
                  onChange={(e) => setProfileStatusTitle(e.target.value)}
                />
                <input
                  className="rounded-2xl border border-black/10 px-4 py-3"
                  placeholder="Right Column Title"
                  value={taekwondoTrainingsTitle}
                  onChange={(e) => setTaekwondoTrainingsTitle(e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <textarea
                  className="min-h-[180px] rounded-2xl border border-black/10 px-4 py-3"
                  placeholder={"Left column items (one per line)\n1. Team Coach at ...\n2. National Coach at ..."}
                  value={profileStatusItemsText}
                  onChange={(e) => setProfileStatusItemsText(e.target.value)}
                />
                <textarea
                  className="min-h-[180px] rounded-2xl border border-black/10 px-4 py-3"
                  placeholder={"Right column items (one per line)\n1. Course ...\n2. Seminar ..."}
                  value={taekwondoTrainingsItemsText}
                  onChange={(e) => setTaekwondoTrainingsItemsText(e.target.value)}
                />
              </div>
            </div>

            <label className="text-sm text-black/70 flex items-center gap-2">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Publish About section
            </label>

            <div className="flex justify-end">
              <Button className="bg-brand-500" onClick={submit} disabled={updateM.isPending}>
                {updateM.isPending ? "Saving..." : "Save About"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
