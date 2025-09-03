"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfidenceBar } from "@/components/confidence-bar"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { listReports } from "@/app/actions/reports"; // Assuming listReports is still relevant
import { runMatching, setMatchStatus } from "@/app/actions/matching"; // Updated import
import ProtectedRoute from "@/components/protected-route"; // Import ProtectedRoute
import useSWR from 'swr'; // Import useSWR
import { useState, useEffect, useMemo } from 'react'; // Import useState, useEffect, useMemo
import { useAuth } from "@/lib/auth"; // Import useAuth to get user_id

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL || "ws://localhost:8000/ws"; // Default WebSocket URL

async function fetchStats() {
  try {
    const lostReportsResponse = await fetch(`${BACKEND_API_URL}/reports?type=LOST&status=OPEN`);
    const lostReports = await lostReportsResponse.json();
    const foundReportsResponse = await fetch(`${BACKEND_API_URL}/reports?type=FOUND&status=OPEN`);
    const foundReports = await foundReportsResponse.json();

    return {
      lostCount: lostReports.length || 0,
      foundCount: foundReports.length || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { lostCount: 0, foundCount: 0 };
  }
}

async function fetchMatches() {
  try {
    const response = await fetch(`${BACKEND_API_URL}/matches?status=PENDING`); // Fetch pending matches
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch matches");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

function VolunteerDashboardPage() {
  const { data: stats, mutate: mutateStats } = useSWR("vol-stats", fetchStats)
  const { data: matches = [], mutate: mutateMatches } = useSWR("vol-matches", fetchMatches)
  const [filter, setFilter] = useState<"all" | "suggested" | "confirmed" | "rejected">("all")
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    mutateStats();
    mutateMatches();

    // Establish WebSocket connection for real-time updates
    let ws: WebSocket | null = null;
    if (user?.username) {
      ws = new WebSocket(`${WEBSOCKET_URL}/${user.username}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        // When a new match notification is received, refetch matches
        if (event.data.startsWith("New match")) {
          mutateMatches();
          toast({
            title: "New Match!",
            description: "A new potential match has been found.",
          });
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [mutateStats, mutateMatches, user]); // Reconnect if user changes

  const list = useMemo(() => {
    if (!matches) return []
    if (filter === "all") return matches
    return matches.filter((m: any) => m.status.toLowerCase() === filter)
  }, [matches, filter])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Volunteer Dashboard</h2>
          <p className="text-sm mt-1">
            Lost reports: <Badge variant="secondary">{stats?.lostCount ?? 0}</Badge> · Found reports:{" "}
            <Badge variant="secondary">{stats?.foundCount ?? 0}</Badge>
            {" · Matches: "}
            <Badge variant="secondary">{(matches as any[])?.length ?? 0}</Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            onClick={async () => {
              await runMatching(); // This will trigger the backend matching job
              await mutateMatches(); // Refetch matches after running the job
            }}
          >
            Run Match
          </Button>
          <a href="/admin" className="text-sm underline">
            Open advanced dashboard →
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "suggested" ? "default" : "outline"} onClick={() => setFilter("suggested")}>
          Suggested
        </Button>
        <Button variant={filter === "confirmed" ? "default" : "outline"} onClick={() => setFilter("confirmed")}>
          Confirmed
        </Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>
          Rejected
        </Button>
      </div>

      <section className="grid md:grid-cols-2 gap-4">
        {list.length === 0 ? (
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>No matches yet</CardTitle>
              <CardDescription>Use “Run Match” to attempt matching Lost and Found reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">You can also review all reports in the advanced dashboard.</div>
            </CardContent>
          </Card>
        ) : (
          list.map((m: any) => (
            <Card key={m.id} className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Potential Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src={
                      m.lost?.photo_url ||
                      m.lost?.photo_base64 ||
                      "/placeholder.svg?height=160&width=240&query=lost%20photo" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt="Lost"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <img
                    src={
                      m.found?.photo_url ||
                      m.found?.photo_base64 ||
                      "/placeholder.svg?height=160&width=240&query=found%20photo" ||
                      "/placeholder.svg" ||
                      "/placeholder.svg"
                    }
                    alt="Found"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <ConfidenceBar value={Number(m.confidence || 0)} />
                <p className="text-sm">
                  Status: <span className="font-medium capitalize">{m.status}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/match/${m.id}`}>View Details</Link>
                  </Button>
                  <Button
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                    onClick={async () => {
                      await setMatchStatus(m.id, "confirmed"); // Use setMatchStatus from matching actions
                      await mutateMatches();
                      toast({
                        title: "सूचना भेजी गई",
                        description: "SMS: ‘आपका बच्चा Rahul Safe Point 2 पर मिल गया है’",
                      })
                    }}
                  >
                    Confirm Reunited
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent"
                    onClick={async () => {
                      await setMatchStatus(m.id, "rejected"); // Use setMatchStatus from matching actions
                      await mutateMatches();
                      toast({ title: "Flagged", description: "False match has been flagged for review." })
                    }}
                  >
                    Flag False Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  )
}

export default function ProtectedVolunteerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="VOLUNTEER">
      <VolunteerDashboardPage />
    </ProtectedRoute>
  );
}
