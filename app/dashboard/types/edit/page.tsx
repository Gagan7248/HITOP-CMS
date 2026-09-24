"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ArticleType = {
  id: string;
  name: string;
  section: string;
};

function EditTypeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [type, setType] = useState<ArticleType | null>(null);
  const [name, setName] = useState("");
  const [section, setSection] = useState("documentation");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadType() {
      if (!id) {
        setError("Article type ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/types?id=${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load article type."
          );
        }

        setType(data);
        setName(data.name);
        setSection(data.section);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load article type."
        );
      } finally {
        setLoading(false);
      }
    }

    loadType();
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      return;
    }

    if (!name.trim()) {
      setError("Article type name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/types?id=${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            section,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update article type."
        );
      }

      router.push("/dashboard/types");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update article type."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading article type...
      </div>
    );
  }

  if (!type) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Article type not found."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Article Type
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the article type information.
        </p>
      </header>

      <div className="p-8">
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Type Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Section
              </label>

              <select
                value={section}
                onChange={(event) =>
                  setSection(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
              >
                <option value="documentation">
                  Documentation
                </option>

                <option value="sop">
                  SOP
                </option>

                <option value="troubleshooting">
                  Troubleshooting
                </option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Link
              href="/dashboard/types"
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditTypePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-slate-500">
          Loading article type...
        </div>
      }
    >
      <EditTypeContent />
    </Suspense>
  );
}