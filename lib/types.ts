export type ReportType = "lost" | "found"
export type ReportStatus = "open" | "matched" | "closed"
export type MatchStatus = "suggested" | "confirmed" | "rejected"

export interface ReportInput {
  type: ReportType
  title: string
  description?: string
  category?: string
  language?: string
  lat?: number
  lng?: number
  location_text?: string
  contact?: string
  photo?: File | null
}

export interface Report extends Omit<ReportInput, "photo"> {
  id: string
  photo_url?: string | null
  photo_base64?: string | null
  status: ReportStatus
  created_by?: string | null
  created_at: string
}

export interface Match {
  id: string
  lost_report_id: string
  found_report_id: string
  scores: { face?: number; image?: number; text?: number; distance?: number }
  fused_score: number
  status: MatchStatus
  created_at: string
}
