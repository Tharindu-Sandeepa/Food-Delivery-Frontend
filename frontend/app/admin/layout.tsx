"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="restaurant" />
      <div className="flex-1 overflow-auto">
        <main className="container mx-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
