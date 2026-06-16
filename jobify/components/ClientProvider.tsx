"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <>{children}</>;
}
