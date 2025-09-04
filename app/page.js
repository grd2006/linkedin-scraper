"use client";
import { useState } from "react";
import { generateReport } from "@/utils/gemini";
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [reports, setReports] = useState([]);

  const scrapeProfiles = async () => {
    if (!profileUrl.trim()) {
      setError("Please enter a LinkedIn profile URL");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrls: [profileUrl.trim()],
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error);
      }

      setProfiles(result.data);
      
      // Generate reports for each profile
      const generatedReports = await Promise.all(
        result.data.map(profile => generateReport(profile))
      );
      setReports(generatedReports);
      
      setProfileUrl(""); // Clear input after successful scrape
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    scrapeProfiles();
  };

  const handleCopy = async (data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">LinkedIn Profile Scraper</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="Enter LinkedIn profile URL"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Generating..." : "Scrape Profile"}
          </button>
        </div>
      </form>

      {error && (
        <p className="text-red-500 mt-4">Error: {error}</p>
      )}

      {profiles.length > 0 && (
        <div className="mt-8">
          {reports.map((report, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-md mb-8">
              <div className="relative">
                <button
                  onClick={() => navigator.clipboard.writeText(report)}
                  className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Copy Report
                </button>
                <div className="bg-white p-4 rounded-md prose prose-sm max-w-none">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
