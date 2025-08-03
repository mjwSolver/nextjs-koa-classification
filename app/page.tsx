// app/page.tsx

'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

// Define a type for the API response for better type safety
type ClassificationResult = {
  prediction?: string;
  confidence?: number;
  // Add other fields from the IBM response as needed
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Reset state when a new file is selected
    setResult(null);
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file first.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred.');
      }

      const data: ClassificationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Knee Osteoarthritis Classification 🩺
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
              Upload Knee X-Ray
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {previewUrl && (
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-800 mb-2">Image Preview:</p>
              <img src={previewUrl} alt="Image preview" className="h-48 w-auto rounded-lg object-cover" />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Classifying...' : 'Classify Knee Image'}
            </button>
          </div>
        </form>

        {isLoading && <div className="text-center text-gray-500">Processing, please wait...</div>}

        {error && <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}

        {result && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800">Classification Result:</h2>
            <div className="mt-2 text-green-700">
              <p className="text-2xl font-bold">{result.prediction || 'N/A'}</p>
              {result.confidence && (
                <p>Confidence: <span className="font-medium">{(result.confidence * 100).toFixed(2)}%</span></p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}