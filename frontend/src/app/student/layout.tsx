"use client"

import { StudentProvider } from "@/contexts/StudentContext";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentProvider>{children}</StudentProvider>;
}
