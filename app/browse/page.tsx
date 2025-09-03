import { listReports } from "@/app/actions/reports"
import BrowseList from "@/components/browse-list"

export default async function BrowsePage() {
  const initial = await listReports({ limit: 50 })
  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold text-balance">Browse nearby reports</h1>
      <BrowseList initialReports={initial || []} />
    </main>
  )
}
