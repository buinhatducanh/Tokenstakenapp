
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export async function sendMagicLink(email: string) {
//   return fetch(`${API_URL}/auth/magic-link`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email }),
//   }).then(r => r.json());
// }

// export async function verifyMagicLink(email: string, token: string) {
//   return fetch(`${API_URL}/auth/verify`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email, token }),
//   }).then(r => r.json());
// }
export async function sendMagicLink(
  email: string,
) {
  return fetch(
    'http://localhost:3000/auth/magic-link',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ email }),
    },
  ).then((r) => r.json());
}

export async function verifyMagicLink(
  email: string,
  token: string,
) {
  return fetch(
    'http://localhost:3000/auth/verify',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        token,
      }),
    },
  ).then((r) => r.json());
}

export async function logout() {
  return fetch("http://localhost:3000/auth/logout", {
    method: "POST",
    credentials: "include",
  }).then((r) => r.json());
}