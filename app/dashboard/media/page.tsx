"use client";

import { useEffect, useState } from "react";

type Media = {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setMedia(data);
      }
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    console.log("UPLOAD FUNCTION TRIGGERED");

    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setUploadMessage(`"${file.name}" uploaded successfully.`);

      // Refresh media list
      await loadMedia();
    } catch (error) {
      setUploadMessage(
        error instanceof Error
          ? error.message
          : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDelete(id: string) {
  console.log("DELETE MEDIA ID:", id);
    const confirmed = window.confirm(
      "Are you sure you want to delete this media?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/media", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete media."
        );
      }

      setMedia((current) =>
        current.filter((item) => item.id !== id)
      );

      setUploadMessage("Media deleted successfully.");
    } catch (error) {
      console.error("Failed to delete media:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete media."
      );
    }
  }

  async function handleCopyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);

      setUploadMessage("Media URL copied.");
    } catch (error) {
      console.error("Failed to copy URL:", error);

      window.alert("Failed to copy URL.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-8 py-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Media Library
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage images and other media used in HITOP articles.
        </p>

        {/* Upload */}
        <div className="mt-4">

          <label className="inline-flex cursor-pointer rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            {uploading ? "Uploading..." : "Upload Media"}

            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>

          {uploadMessage && (
            <p className="mt-2 text-sm text-slate-600">
              {uploadMessage}
            </p>
          )}

        </div>

      </header>

      {/* Media Content */}
      <div className="p-8">

        {loading ? (

          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading media...
          </div>

        ) : media.length === 0 ? (

          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">

            <p className="text-lg font-semibold text-slate-700">
              No media found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Uploaded media will appear here.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {media.map((item) => (

              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >

                {/* Image */}
                <div className="aspect-video bg-slate-100">

                  {item.mime_type.startsWith("image/") && (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  )}

                </div>

                {/* Details */}
                <div className="p-4">

                  <p className="truncate font-medium text-slate-900">
                    {item.filename}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {Math.round(item.size / 1024)} KB
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyUrl(item.url)
                      }
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Copy URL
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}