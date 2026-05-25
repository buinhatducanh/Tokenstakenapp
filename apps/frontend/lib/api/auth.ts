
const API_URL = "http://localhost:3000";

// ==================================================
// SEND MAGIC LINK
// ==================================================
export async function sendMagicLink(email: string) {
  const res = await fetch(`${API_URL}/auth/magic-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

// ==================================================
// VERIFY MAGIC LINK
// ==================================================
export async function verifyMagicLink(email: string, token: string) {
  const res = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      token,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}

// ==================================================
// LOGOUT
// ==================================================
export async function logout() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw data;
  }

  return data;
}