import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NIT Andhra Pradesh - Mentor-Mentee Portal",
  description: "Comprehensive mentor-mentee management system for colleges",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/clglogo.jpg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/clglogo.jpg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/clglogo.jpg",
        type: "image/jpeg",
      },
    ],
    apple: "/clglogo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
