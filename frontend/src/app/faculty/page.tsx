"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push("/faculty/dashboard");
  }, [router]);

  return null;
}
