import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import LoaderFull from "../../components/common/LoaderFull";
import { MessagesAPI } from "../../services/messages.service";

export default function Inbox() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const q = useQuery({ queryKey:["messages"], queryFn: MessagesAPI.adminAll });
  const contactQ = useQuery({ queryKey: ["admin-contact-info"], queryFn: MessagesAPI.adminContactInfo });
  const [contactForm, setContactForm] = useState({ email: "", phone: "", location: "", isPublished: true });

  useEffect(() => {
    if (!contactQ.data) return;
    setContactForm({
      email: contactQ.data.email || "",
      phone: contactQ.data.phone || "",
      location: contactQ.data.location || "",
      isPublished: typeof contactQ.data.isPublished === "boolean" ? contactQ.data.isPublished : true,
    });
  }, [contactQ.data]);

  const readM = useMutation({
    mutationFn: MessagesAPI.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Marked as read");
    },
  });

  const deleteM = useMutation({
    mutationFn: MessagesAPI.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message deleted");
    },
  });

  const saveContactM = useMutation({
    mutationFn: MessagesAPI.saveAdminContactInfo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-info"] });
      qc.invalidateQueries({ queryKey: ["contact-info-public"] });
      toast.success("Contact info updated");
    },
  });

  if (q.isLoading) return <LoaderFull label="Loading messages..." />;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">
            Manage Contact & Messages<span className="text-brand-500">.</span>
          </h2>
          <Button onClick={() => navigate("/admin/dashboard")}>Dashboard</Button>
        </div>

        <Card className="mt-6 p-4">
          <div className="text-lg font-bold">Contact Page Details</div>
          <div className="text-sm text-black/60 mt-1">Edit Email, Phone and Location shown on Contact page.</div>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <input
              className="px-3 py-2 border rounded-xl"
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
            />
            <input
              className="px-3 py-2 border rounded-xl"
              placeholder="Phone"
              value={contactForm.phone}
              onChange={(e) => setContactForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <input
              className="px-3 py-2 border rounded-xl md:col-span-2"
              placeholder="Location"
              value={contactForm.location}
              onChange={(e) => setContactForm((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!contactForm.isPublished}
              onChange={(e) => setContactForm((p) => ({ ...p, isPublished: e.target.checked }))}
            />
            Show contact info on public Contact page
          </label>
          <div className="mt-4">
            <Button onClick={() => saveContactM.mutate(contactForm)} disabled={saveContactM.isPending || contactQ.isLoading}>
              {saveContactM.isPending ? "Saving..." : "Save Contact Info"}
            </Button>
          </div>
        </Card>

        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Inbox Messages</h3>
        </div>

        <div className="grid gap-3">
          {q.data.map((m)=>(
            <Card key={m._id} className={`p-4 ${!m.isRead ? "border-l-4 border-brand-500" : ""}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">{m.name} ({m.email})</div>
                  <div className="text-sm text-black/60">{m.subject}</div>
                  <p className="mt-2 text-sm">{m.message}</p>
                </div>

                <div className="flex flex-col gap-2">
                  {!m.isRead && (
                    <Button onClick={()=>readM.mutate(m._id)}>Mark Read</Button>
                  )}
                  <Button className="bg-black" onClick={()=>deleteM.mutate(m._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}

          {q.data.length===0 && (
            <Card className="p-6">
              <div className="font-semibold">No messages</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
