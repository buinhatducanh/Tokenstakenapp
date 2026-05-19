const API = "http://localhost:3000";

export async function requestMagicLink(email: string) {
  return fetch(`${API}/auth/magic-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then(r => r.json());
}

export async function verifyMagicLink(email: string, token: string) {
  return fetch(`${API}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  }).then(r => r.json());
}