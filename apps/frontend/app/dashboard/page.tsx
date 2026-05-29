// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getToken } from "@/lib/auth/token";

// export default function Dashboard() {
//   const router = useRouter();

//   useEffect(() => {
//     if (!getToken()) router.push("/login");
//   }, []);

//   return <div>Dashboard</div>;
// }