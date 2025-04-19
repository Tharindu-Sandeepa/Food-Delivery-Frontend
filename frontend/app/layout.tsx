import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import "./globals.css"
import { AuthProvider } from '../hooks/useAuth';
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <Providers>
      <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
