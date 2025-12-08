"use client";

import React, { useState } from "react";
import Papa from "papaparse";

type Row = Record<string, any>;

export default function MarksUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [examType, setExamType] = useState("Internal");
  const [maxMarks, setMaxMarks] = useState(100);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setStatus(null);
  };

  const parseCsvFile = (file: File): Promise<Row[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0) {
            reject(results.errors[0]);
          } else {
            resolve(results.data as Row[]);
          }
        },
        error: (err) => reject(err),
      });
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const rows = await parseCsvFile(file);

      const body = {
        rows, // will be picked by your API route
        examType,
        maxMarks,
      };

      const res = await fetch("/api/marks/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(
          data?.error ||
            `Upload failed with status ${res.status}`,
        );
        return;
      }

      setStatus(
        `Upload successful. Created: ${data.createdCount}, Updated: ${data.updatedCount}. Problems: ${data.problems?.length || 0}`,
      );
    } catch (err: any) {
      console.error(err);
      setStatus("Unexpected error while uploading. Check console/logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Upload Marks</h1>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">
          CSV file (with headers)
        </label>
        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">Exam type</label>
        <input
          type="text"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />
      </div>

      <div className="mb-3">
        <label className="block mb-1 text-sm font-medium">Max marks</label>
        <input
          type="number"
          value={maxMarks}
          onChange={(e) => setMaxMarks(Number(e.target.value))}
          className="border rounded px-2 py-1 w-full"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {status && (
        <p className="mt-3 text-sm">
          {status}
        </p>
      )}
    </div>
  );
}
