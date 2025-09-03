"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Globe, Search, Package, Users, QrCode, MapPin, Sigma as Sitemap } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthUserMenu } from "@/components/auth-user-menu"
import { AccessibilityControls } from "@/components/accessibility-controls"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const [a11yOpen, setA11yOpen] = useState(false)

  const nav = [
    { href: "/", label: "Home", icon: null },
    { href: "/lost", label: "Report Lost", icon: Search },
    { href: "/found", label: "Report Found", icon: Package },
    { href: "/browse", label: "Nearby", icon: MapPin },
    { href: "/workflow", label: "Workflow", icon: Sitemap },
    { href: "/volunteer", label: "Volunteer", icon: Users },
    { href: "/scan", label: "Scan", icon: QrCode },
  ]

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          LOFT
        </Link>
        <nav className="flex items-center gap-2">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("px-3 py-2 rounded-lg text-sm hover:bg-gray-100", active && "bg-gray-100")}
              >
                <span className="inline-flex items-center gap-2">
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl bg-transparent"
            onClick={() => setA11yOpen(true)}
            aria-label="Accessibility controls"
          >
            Aa
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl bg-transparent">
                <Globe className="h-4 w-4 mr-2" />
                {language}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["English", "Hindi", "Marathi", "Bhojpuri", "Bengali", "Tamil"].map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang as any)}>
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AuthUserMenu />
          <AccessibilityControls open={a11yOpen} onOpenChange={setA11yOpen} />
        </div>
      </div>
    </header>
  )
}
