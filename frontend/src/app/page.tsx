"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      switch(userRole) {
        case 'student':
          router.push("/student");
          break;
        case 'faculty':
          router.push("/faculty");
          break;
        case 'hod':
          router.push("/hod");
          break;
        default:
          router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router, isAuthenticated, userRole]);

  return null;
}
