"use client";

import { useState } from "react";

export default function BackupPage() {
  const [loading, setLoading] = useState(false);

  const createBackup = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/backup");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.error || "Failed to create backup."
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `HITOP-Backup-${new Date()
        .toISOString()
        .slice(0, 10)}.zip`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("BACKUP DOWNLOAD ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create backup."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Backup
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a backup of your HITOP CMS data.
        </p>
      </header>

      <div className="p-8">
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Create Backup
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This backup contains your HITOP CMS database data.
          </p>

          <button
            type="button"
            onClick={createBackup}
            disabled={loading}
            className="mt-6 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Backup..." : "Download Backup"}
          </button>

        </div>
      </div>
    </div>
  );
}