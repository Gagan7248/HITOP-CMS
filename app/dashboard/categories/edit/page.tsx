"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  section: string;
};

function EditCategoryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [section, setSection] = useState("documentation");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategory() {
      if (!id) {
        setError("Category ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/categories?id=${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load category."
          );
        }

        setCategory(data);
        setName(data.name);
        setSection(data.section);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load category."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [id]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/categories?id=${encodeURIComponent(id)}`,
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
          data.error || "Failed to update category."
        );
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update category."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-slate-500">
        Loading category...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">

        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Category not found."}
        </div>

      </div>
    );
  }

  return (
    <div>

      <header className="border-b border-slate-200 bg-white px-8 py-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Edit Category
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the category information.
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
                Category Name
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
              href="/dashboard/categories"
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

export default function EditCategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditCategoryPageContent />
    </Suspense>
  );
}