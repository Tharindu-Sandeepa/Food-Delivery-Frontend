"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/store/store"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/useAuth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}
