"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTypePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [section, setSection] = useState("documentation");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Article type name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          section,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create article type."
        );
      }

      router.push("/dashboard/types");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create article type."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>

      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Add Article Type
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a new type for HITOP articles.
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
                placeholder="Example: How-to Guide"
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
              {saving ? "Saving..." : "Create Type"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}