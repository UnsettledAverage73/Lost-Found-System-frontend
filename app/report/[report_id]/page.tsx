'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { ProtectedRoute } from '@/components/protected-route';
import { getReportById } from '@/app/actions/reports';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface Report {
  _id: string;
  type: 'LOST' | 'FOUND';
  subject: 'PERSON' | 'ITEM';
  refs: string[]; // These will be IDs of Person/Item documents
  desc_text: string;
  language: string;
  photo_ids: string[]; // GridFS file IDs
  photo_urls?: string[]; // Base64 encoded images from backend
  location: string;
  status: 'OPEN' | 'MATCHED' | 'REUNITED' | 'CLOSED';
  created_at: string;
  // Potentially add more fields here if your ReportSchema includes them
}

const fetcher = async (args: [string, string, string | null]) => {
  const [_, reportId, token] = args;
  if (!token) throw new Error('No authentication token found.');

  const result = await getReportById(reportId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch report.');
  }
  return result.data;
};

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.report_id as string;
  const { isAuthenticated, token } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: report, error, isLoading } = useSWR(
    isAuthenticated && token && reportId ? ['/api/reports', reportId, token] : null,
    fetcher
  );

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message || 'An error occurred while loading the report.');
    }
  }, [error]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading report details...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (errorMessage) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-red-500 text-center py-4">
            Error: {errorMessage}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!report) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen p-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-center py-4">
            Report not found.
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold mb-6">Report Details</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Report ID: {report._id}</CardTitle>
            <CardDescription>Created: {new Date(report.created_at).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Type:</strong> {report.type}</p>
            <p><strong>Subject:</strong> {report.subject}</p>
            <p><strong>Description:</strong> {report.desc_text}</p>
            <p><strong>Location:</strong> {report.location}</p>
            <p><strong>Language:</strong> {report.language}</p>
            <p><strong>Status:</strong> {report.status}</p>
            {report.refs && report.refs.length > 0 && (
              <p><strong>References (IDs):</strong> {report.refs.join(', ')}</p>
            )}

            {report.photo_urls && report.photo_urls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Photos:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {report.photo_urls.map((photoUrl, index) => (
                    <div key={index} className="relative w-full aspect-square overflow-hidden rounded-md">
                      <Image
                        src={`data:image/jpeg;base64,${photoUrl}`} // Assuming JPEG, adjust if needed
                        alt={`Report photo ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
