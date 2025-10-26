"use client"

import { FacultyProvider } from "@/contexts/FacultyContext";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FacultyProvider>{children}</FacultyProvider>;
}
