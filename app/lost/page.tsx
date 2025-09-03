import { ReportForm } from "@/components/report-form"
import { listReports } from "@/app/actions/reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ReportLostPage() {
  const reports = await listReports("lost")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Report Lost</h2>
      <ReportForm mode="lost" />
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Lost Reports</h3>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lost reports yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.slice(0, 6).map((r: any) => (
              <Card key={r.id} className="rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img
                    src={
                      r.photo_url ||
                      r.photo_base64 ||
                      "/placeholder.svg?height=160&width=240&query=lost%20report%20photo" ||
                      "/placeholder.svg"
                    }
                    alt="Report photo"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground line-clamp-3">{r.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
