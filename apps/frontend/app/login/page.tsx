// import LoginView from "./LoginView";

// export default function Page() {

//   return <LoginView />;
// }
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoginView from "./LoginView";

export default function Page() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  return (
    <LoginView
      initialEmail={email}
      initialToken={token}
    />
  );
}


