"use client";

import { isAdmin }
from '@/lib/auth/guard';

export default function Navbar() {
  return (
    <div>
      <h1>APP</h1>

      {isAdmin() && (
        <button>
          Admin Panel
        </button>
      )}
    </div>
  );
}