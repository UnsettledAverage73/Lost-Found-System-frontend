import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { OfflineBanner } from "@/components/offline-banner"
import { LanguageProvider } from "@/components/language-provider"
import { Suspense } from "react"
import MobileQuickActions from "@/components/mobile-quick-actions"
import { OfflineQueueToaster } from "@/components/offline-queue-toaster"
import { AuthProvider } from "@/lib/auth"; // Import the AuthProvider

export const metadata: Metadata = {
  title: "LOFT – Smart Lost & Found",
  description: "A safe, accessible way to reunite people with their belongings during mega-events.",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider> {/* Wrap with AuthProvider */}
            <LanguageProvider>
              <OfflineBanner />
              <Navbar />
              <main className="min-h-[calc(100dvh-160px)]">{children}</main>
              <OfflineQueueToaster />
              <Footer />
              <MobileQuickActions />
            </LanguageProvider>
          </AuthProvider>
        </Suspense>
        <Toaster />
        <Analytics />
        {/* PWA service worker registration */}
        <Suspense fallback={null}>
          {/* @ts-expect-error Async component in RSC boundary */}
          {(async function SW() {
            const { SwRegister } = await import("@/components/sw-register")
            return <SwRegister />
          })()}
        </Suspense>
      </body>
    </html>
  )
}
