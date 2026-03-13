import api from "./api";

export const MessagesAPI = {
  send: (p) => api.post("/messages", p).then(r => r.data),
  contactInfo: () => api.get("/messages/contact-info").then(r => r.data),
  adminAll: () => api.get("/messages/admin/all").then(r => r.data),
  markRead: (id) => api.put(`/messages/admin/read/${id}`).then(r => r.data),
  remove: (id) => api.delete(`/messages/admin/${id}`).then(r => r.data),
  adminContactInfo: () => api.get("/messages/admin/contact-info").then(r => r.data),
  saveAdminContactInfo: (p) => api.put("/messages/admin/contact-info", p).then(r => r.data),
};
