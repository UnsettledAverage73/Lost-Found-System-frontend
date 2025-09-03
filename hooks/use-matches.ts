"use client"

import useSWR, { mutate } from "swr"
import { useReports, type Report } from "./use-reports"

export type MatchRecord = {
  id: string
  lostId: string
  foundId: string
  lostPhoto?: string
  foundPhoto?: string
  confidence: number // 0..1
  status: "pending" | "reunited" | "flagged"
  createdAt: number
}

type MatchesData = { list: MatchRecord[] }

const KEY = "loft:matches"

const fetcher = () => {
  if (typeof window === "undefined") return { list: [] } as MatchesData
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as MatchesData) : { list: [] }
  } catch {
    return { list: [] }
  }
}

const save = (data: MatchesData) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

function randomConfidence() {
  // 0.55 - 0.98 range
  return Math.round((0.55 + Math.random() * 0.43) * 100) / 100
}

function simpleHeuristic(a: Report, b: Report) {
  // Very naive: language match boosts score, description overlap adds a bit
  let c = 0.5
  if (a.language === b.language) c += 0.2
  const aWords = new Set(a.description.toLowerCase().split(/\W+/).filter(Boolean))
  const bWords = new Set(b.description.toLowerCase().split(/\W+/).filter(Boolean))
  const overlap = [...aWords].filter((w) => bWords.has(w)).length
  c += Math.min(0.3, overlap * 0.05)
  return Math.min(0.98, Math.max(0.55, c))
}

export function useMatches() {
  const { data: reports } = useReports()
  const { data } = useSWR<MatchesData>(KEY, fetcher, { revalidateOnFocus: false })
  const current: MatchesData = data || { list: [] }

  const createMatch = () => {
    if (reports.lost.length === 0 || reports.found.length === 0) return null
    const lost = reports.lost[0]
    const found = reports.found[0]
    const conf = simpleHeuristic(lost, found) || randomConfidence()
    const rec: MatchRecord = {
      id: crypto.randomUUID(),
      lostId: lost.id,
      foundId: found.id,
      lostPhoto: lost.photos[0],
      foundPhoto: found.photos[0],
      confidence: conf,
      status: "pending",
      createdAt: Date.now(),
    }
    const next: MatchesData = { list: [rec, ...current.list] }
    save(next)
    mutate(KEY, next, false)
    return rec
  }

  const updateMatch = (id: string, status: MatchRecord["status"]) => {
    const next: MatchesData = { list: current.list.map((m) => (m.id === id ? { ...m, status } : m)) }
    save(next)
    mutate(KEY, next, false)
  }

  return {
    data: current,
    createMatch,
    updateMatch,
  }
}
