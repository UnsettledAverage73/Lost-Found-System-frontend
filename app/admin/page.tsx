"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { runMatching, setMatchStatus } from "@/app/actions/matching"
import { listReports } from "@/app/actions/reports"; // Assuming listReports is still relevant
import ProtectedRoute from "@/components/protected-route"; // Import ProtectedRoute
import useSWR from 'swr'; // Import useSWR
import { useState, useEffect, useMemo } from 'react'; // Import useState, useEffect, useMemo
import { useAuth } from "@/lib/auth"; // Import useAuth to get user_id

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_URL || "ws://localhost:8000/ws"; // Default WebSocket URL

const fetchReports = async () => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/reports?status=OPEN`); // Fetch open reports
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch reports");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching reports:", error);
    return [];
  }
}

const fetchMatches = async () => {
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

function AdminPage() {
  const { data: reports = [], mutate: mutateReports } = useSWR("reports", fetchReports)
  const { data: matches = [], mutate: mutateMatches } = useSWR("matches", fetchMatches)
  const [q, setQ] = useState("")
  const { user } = useAuth(); // Get user from auth context

  useEffect(() => {
    mutateReports();
    mutateMatches();

    // Establish WebSocket connection for real-time updates
    let ws: WebSocket | null = null;
    if (user?.username) {
      ws = new WebSocket(`${WEBSOCKET_URL}/${user.username}`);

      ws.onopen = () => {
        console.log('Admin WebSocket connected');
      };

      ws.onmessage = (event) => {
        console.log('Admin WebSocket message received:', event.data);
        // When a new match notification is received, refetch matches
        if (event.data.startsWith("New match")) {
          mutateMatches();
          // No toast for admin, as they see the dashboard directly updating
        }
      };

      ws.onclose = () => {
        console.log('Admin WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
      };
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [mutateReports, mutateMatches, user]); // Reconnect if user changes

  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return !s
      ? reports
      : reports.filter(
          (r: any) =>
            (r.description_text || "").toLowerCase().includes(s) || // Assuming description_text is the relevant field
            (r.ref_ids || []).join(" ").toLowerCase().includes(s), // Assuming ref_ids contains searchable text
        )
  }, [reports, q])

  return (
    <main className="container mx-auto max-w-6xl p-4 flex flex-col gap-6">
      <section className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-balance">Volunteer Dashboard</h1>
        <div className="flex items-center gap-2">
          <Input placeholder="Search reports..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Button
            onClick={async () => {
              await runMatching()
              await mutateMatches()
            }}
          >
            Run matching
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Reports {reports ? `(${reports.length})` : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-auto pr-2">
              {filtered.map((r: any) => (
                <div key={r.id} className="border rounded p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {r.description_text || "(no description)"} <span className="text-xs text-muted-foreground ml-2">[{r.type}]</span>
                    </div>
                    <div className="text-xs">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">{r.description_text}</div>
                  {r.ref_ids?.length ? <div className="text-xs">Refs: {r.ref_ids.join(", ")}</div> : null}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-muted">{r.status}</span>
                    {r.location ? <span className="px-2 py-0.5 rounded bg-muted">{r.location}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matches {matches ? `(${matches.length})` : ""}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-auto pr-2">
              {matches.map((m: any) => (
                <div key={m.id} className="border rounded p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {m.lost_report_id || "Lost"} ↔ {m.found_report_id || "Found"} {/* Display IDs for now */}
                    </div>
                    <div className="text-xs">{Math.round(m.fused_score * 100)}%</div> {/* Using fused_score */}
                  </div>
                  <div className="text-sm text-muted-foreground">{m.status}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await setMatchStatus(m.id, "confirmed")
                        await mutateMatches()
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await setMatchStatus(m.id, "rejected")
                        await mutateMatches()
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default function ProtectedAdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminPage />
    </ProtectedRoute>
  );
}
