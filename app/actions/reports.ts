"use server"

import type { ReportInput, Report, Match, MatchStatus } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

async function fileToFormData(file: File, fieldName: string = "file"): Promise<FormData> {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}

export async function createReport(
  input: ReportInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const formData = new FormData();
    formData.append("subject", input.subject_type); // assuming subject_type is "PERSON" or "ITEM"
    formData.append("refs", input.ref_ids.join(","));
    formData.append("desc_text", input.description_text);
    formData.append("lang", input.language);
    formData.append("location", input.location);
    if (input.photo) {
      formData.append("photos", input.photo);
    }

    const response = await fetch(`${BACKEND_API_URL}/reports/${input.type.toLowerCase()}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, error: errorData.detail || "Failed to create report" };
    }

    const report = await response.json();
    return { ok: true, id: report.id };
  } catch (error: any) {
    return { ok: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function createReportFromForm(formData: FormData) {
  const type = (formData.get("type") as "lost" | "found") || "lost"
  const subject_type = (formData.get("subject") as "PERSON" | "ITEM") || "PERSON"
  const ref_ids_str = (formData.get("refs") as string) || ""
  const description_text = (formData.get("description") as string) || ""
  const language = (formData.get("language") as string) || "English"
  const location = (formData.get("location") as string) || ""
  const photo = (formData.get("photo") as File) || null

  const res = await createReport({
    type,
    subject_type,
    ref_ids: ref_ids_str.split(',').map(s => s.trim()),
    description_text,
    language,
    location,
    photo,
  })
  if (!res.ok) throw new Error(res.error)
  revalidatePath(`/${type}`)
  redirect(`/${type}`)
}

export async function listReports(type?: "lost" | "found"): Promise<Report[]> {
  try {
    const url = type ? `${BACKEND_API_URL}/reports?type=${type}` : `${BACKEND_API_URL}/reports`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch reports");
    }

    const reports = await response.json();
    return reports as Report[];
  } catch (error: any) {
    console.error("Error listing reports:", error);
    return [];
  }
}

export async function getReport(id: string): Promise<Report | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/reports/${id}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch report");
    }

    const report = await response.json();
    return report as Report;
  } catch (error: any) {
    console.error(`Error getting report ${id}:`, error);
    return null;
  }
}
