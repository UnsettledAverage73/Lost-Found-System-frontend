// frontend/app/new-report/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createReportFromForm } from '@/app/actions/reports'; // Import the updated action

export default function NewReportPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
  const [subjectType, setSubjectType] = useState<'PERSON' | 'ITEM'>('ITEM');
  const [description, setDescription] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [location, setLocation] = useState<string>('');
  const [photos, setPhotos] = useState<FileList | null>(null);

  // Conditional fields
  const [itemName, setItemName] = useState<string>('');
  const [itemColor, setItemColor] = useState<string>('');
  const [itemBrand, setItemBrand] = useState<string>('');

  const [personName, setPersonName] = useState<string>('');
  const [personAge, setPersonAge] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('type', reportType);
    formData.append('subject_type', subjectType);
    formData.append('description_text', description);
    formData.append('language', language);
    formData.append('location', location);
    formData.append('ref_ids_str', 'placeholder_id'); // Temporary placeholder, adjust as needed

    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i]);
      }
    }

    // Append conditional fields
    if (subjectType === 'ITEM') {
      formData.append('item_name', itemName);
      formData.append('item_color', itemColor);
      formData.append('item_brand', itemBrand);
    } else if (subjectType === 'PERSON') {
      formData.append('person_name', personName);
      formData.append('person_age', personAge);
      formData.append('guardian_contact', guardianContact);
    }

    try {
      const result = await createReportFromForm(formData);
      if (result.success) {
        setSuccessMessage(result.message || 'Report submitted successfully!');
        // Redirect or clear form after a short delay
        setTimeout(() => {
          router.push('/volunteer'); // Redirect to dashboard
        }, 2000);
      } else {
        setError(result.message || 'Failed to submit report.');
      }
    } catch (err: any) {
      console.error("Client-side error submitting report:", err);
      setError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Report</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div>
          <Label htmlFor="reportType">Report Type</Label>
          <RadioGroup value={reportType} onValueChange={(value: 'LOST' | 'FOUND') => setReportType(value)} className="flex space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LOST" id="report-lost" />
              <Label htmlFor="report-lost">Lost</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FOUND" id="report-found" />
              <Label htmlFor="report-found">Found</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Subject Type */}
        <div>
          <Label htmlFor="subjectType">Subject Type</Label>
          <RadioGroup value={subjectType} onValueChange={(value: 'PERSON' | 'ITEM') => setSubjectType(value)} className="flex space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ITEM" id="subject-item" />
              <Label htmlFor="subject-item">Item</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PERSON" id="subject-person" />
              <Label htmlFor="subject-person">Person</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conditional Fields based on Subject Type */}
        {subjectType === 'ITEM' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemColor">Item Color</Label>
              <Input id="itemColor" value={itemColor} onChange={(e) => setItemColor(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemBrand">Item Brand (Optional)</Label>
              <Input id="itemBrand" value={itemBrand} onChange={(e) => setItemBrand(e.target.value)} />
            </div>
          </div>
        )}

        {subjectType === 'PERSON' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="personName">Person Name (Optional)</Label>
              <Input id="personName" value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="personAge">Person Age (Optional)</Label>
              <Input id="personAge" type="number" value={personAge} onChange={(e) => setPersonAge(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="guardianContact">Guardian Contact (Optional)</Label>
              <Input id="guardianContact" value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        {/* Language */}
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Marathi">Marathi</SelectItem>
              <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
              <SelectItem value="Bengali">Bengali</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        {/* Photos */}
        <div>
          <Label htmlFor="photos">Photos (Optional)</Label>
          <Input id="photos" type="file" multiple accept="image/*" onChange={(e) => setPhotos(e.target.files)} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}
