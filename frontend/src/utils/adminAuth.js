const TOKEN_KEY = "adminToken";

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminToken(token) {
  if (!token) return;
  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
}

export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
