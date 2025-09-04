"use client";
import { useState } from "react";
import { generateReport } from "@/utils/gemini";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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
                <div className="bg-white p-6 rounded-md prose prose-slate lg:prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4 space-y-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                      li: ({node, ...props}) => <li className="my-1" {...props} />,
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-gray-100 rounded px-1" {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {report}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
