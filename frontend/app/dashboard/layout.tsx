"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/Sidebar";

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.role === "patient" && pathname === "/dashboard") {
      router.replace("/dashboard/my-records");
    }
  }, [user, pathname, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted text-sm">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-paper relative overflow-hidden">
      {/* subtle depth blobs, echoing the login hero's background treatment */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-teal/5 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-96 h-96 rounded-full bg-indigo/5 blur-3xl pointer-events-none" />

      <Sidebar />
      <main className="flex-1 px-8 py-7 max-w-6xl relative">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Guard>{children}</Guard>
    </AuthProvider>
  );
}
