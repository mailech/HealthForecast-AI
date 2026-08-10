"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    const hasToken = typeof window !== "undefined" && localStorage.getItem("hf_access_token");
    router.replace(hasToken ? "/dashboard" : "/login");
  }, [router]);
  return null;
}
