"use client"

import { useParams, useRouter } from "next/navigation"
import { useMatches } from "@/hooks/use-matches"
import { useReports } from "@/hooks/use-reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBar } from "@/components/confidence-bar"

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: matches, updateMatch } = useMatches()
  const { getReportById } = useReports()

  const match = matches.list.find((m) => m.id === id)
  if (!match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm">Match not found.</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/volunteer")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const lost = getReportById(match.lostId)
  const found = getReportById(match.foundId)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Match Details</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Lost Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lost?.photos?.[0] ? (
              <img
                src={lost.photos[0] || "/placeholder.svg"}
                alt="Lost item"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">No photo</div>
            )}
            <p className="text-sm">
              <span className="font-medium">Language:</span> {lost?.language}
            </p>
            <p className="text-sm">{lost?.description}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Found Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {found?.photos?.[0] ? (
              <img
                src={found.photos[0] || "/placeholder.svg"}
                alt="Found item"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">No photo</div>
            )}
            <p className="text-sm">
              <span className="font-medium">Language:</span> {found?.language}
            </p>
            <p className="text-sm">{found?.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <ConfidenceBar value={match.confidence} />
        <div className="flex gap-3">
          <Button
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
            onClick={() => updateMatch(match.id, "reunited")}
          >
            Confirm Match
          </Button>
          <Button
            variant="outline"
            className="rounded-xl bg-transparent"
            onClick={() => updateMatch(match.id, "flagged")}
          >
            Flag False Match
          </Button>
        </div>
      </div>
    </div>
  )
}
