import api from "./api";

export const AuthAPI = {
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};
