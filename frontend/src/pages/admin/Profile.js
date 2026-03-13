import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoaderFull from "../../components/common/LoaderFull";
import { AboutAPI } from "../../services/about.service";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["admin-profile"],
    queryFn: AboutAPI.getAdmin,
  });

  const data = useMemo(() => q.data || null, [q.data]);

  const [profileName, setProfileName] = useState("Dipendra Dhakal");
  const [profileTitle, setProfileTitle] = useState("International Taekwondo Referee");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (!data) return;
    setProfileName(data.profileName || "Dipendra Dhakal");
    setProfileTitle(data.profileTitle || "International Taekwondo Referee");
    setProfileImageUrl(data.profileImageUrl || data.imageUrl || "");
  }, [data]);

  const updateM = useMutation({
    mutationFn: AboutAPI.update,
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
      qc.invalidateQueries({ queryKey: ["admin-about"] });
      qc.invalidateQueries({ queryKey: ["about-public"] });
      qc.invalidateQueries({ queryKey: ["home-about"] });
      qc.invalidateQueries({ queryKey: ["navbar-owner-profile"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Update failed"),
  });

  if (q.isLoading) return <LoaderFull label="Loading Profile..." />;

  const submit = () => {
    updateM.mutate({
      profileName,
      profileTitle,
      profileImageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            Manage Profile<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
        </div>

        <Card className="p-5 mt-6">
          <div className="grid gap-3">
            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Profile Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Profile Title"
              value={profileTitle}
              onChange={(e) => setProfileTitle(e.target.value)}
            />
            <input
              className="rounded-2xl border border-black/10 px-4 py-3"
              placeholder="Profile Image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
            />

            <div className="flex justify-end">
              <Button className="bg-brand-500" onClick={submit} disabled={updateM.isPending}>
                {updateM.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
