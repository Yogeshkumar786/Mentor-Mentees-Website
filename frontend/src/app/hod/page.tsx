"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HODIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push("/hod/dashboard");
  }, [router]);

  return null;
}
