"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Share2, MessageCircle, Send } from "lucide-react"

export default function ShareReportPage({ params }: { params: { id: string } }) {
  const [dataUrl, setDataUrl] = useState<string>("")
  const link = typeof window !== "undefined" && params?.id ? `${window.location.origin}/report/${params.id}` : undefined

  const shareText =
    link &&
    `Please help reunite via LOFT. Report link: ${link} — Share with volunteers or help desk. धन्यवाद / Thank you.`

  useEffect(() => {
    let cancelled = false
    async function go() {
      if (!link) return
      const { toDataURL } = await import("qrcode")
      const url = await toDataURL(link, {
        margin: 1,
        width: 320,
        color: { dark: "#0ea5e9", light: "#ffffff" },
      })
      if (!cancelled) setDataUrl(url)
    }
    go()
    return () => {
      cancelled = true
    }
  }, [link])

  const onShare = async () => {
    if (link && navigator.share) {
      await navigator.share({ title: "LOFT Report", url: link })
      return
    }
    if (link) {
      await navigator.clipboard.writeText(link)
      alert("Link copied")
    }
  }

  return (
    <main className="container mx-auto max-w-md p-4 flex flex-col items-center gap-4">
      <h1 className="text-xl font-semibold text-center text-balance">Share Report</h1>
      {dataUrl ? (
        <Image
          src={dataUrl || "/placeholder.svg"}
          alt="Report QR"
          width={320}
          height={320}
          className="rounded border bg-white"
        />
      ) : (
        <div className="w-[320px] h-[320px] rounded border bg-muted" />
      )}
      <div className="flex flex-col w-full items-stretch gap-2">
        <Button onClick={onShare} className="w-full">
          <Share2 className="h-4 w-4 mr-2" /> Share link
        </Button>

        {link && (
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText as string)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
            </a>
          </Button>
        )}

        {link && (
          <Button asChild variant="secondary" className="w-full">
            <a href={`sms:?&body=${encodeURIComponent(shareText as string)}`} aria-label="Share via SMS">
              <Send className="h-4 w-4 mr-2" /> SMS
            </a>
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Show this code to volunteers to quickly access your report.
      </p>
    </main>
  )
}
