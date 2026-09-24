"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Networking");
  const [section, setSection] = useState("documentation");
  const [type, setType] = useState("How-to Guide");
  const [status, setStatus] = useState("Draft");
  const [content, setContent] = useState("");

const [categories, setCategories] = useState<
  { id: string; name: string }[]
>([]);

const [types, setTypes] = useState<
  { id: string; name: string }[]
>([]);

useEffect(() => {
  async function loadOptions() {
    try {
      const [categoryResponse, typeResponse] = await Promise.all([
        fetch(`/api/categories?section=${section}`),
        fetch(`/api/types?section=${section}`),
      ]);

      const categoryData = await categoryResponse.json();
      const typeData = await typeResponse.json();

      setCategories(categoryData);
      setTypes(typeData);

      setCategory(categoryData[0]?.name || "");
      setType(typeData[0]?.name || "");
    } catch (error) {
      console.error("Failed to load categories/types:", error);
    }
  }

  loadOptions();
}, [section]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
          section,
          type,
          status,
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create article.");
      }

      router.push("/dashboard/articles");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create article."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/dashboard/articles"
            className="flex items-center gap-3"
          >
            <div>
              <div className="text-lg font-bold">
                HITOP CMS
              </div>

              <div className="text-xs text-blue-100">
                Hotel IT Operating Procedure
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/articles"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500"
          >
            Back to Articles
          </Link>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            New Article
          </h1>

          <p className="mt-2 text-slate-500">
            Create a new HITOP knowledge base article.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-sm"
        >

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Article Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: How to troubleshoot DNS"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Short description of this article..."
                rows={3}
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

<div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Section
  </label>

  <select
    value={section}
    onChange={(event) => setSection(event.target.value)}
    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
  >
    <option value="documentation">Documentation</option>
    <option value="sop">SOP</option>
    <option value="troubleshooting">Troubleshooting</option>
  </select>
</div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

             <select
  value={category}
  onChange={(event) => setCategory(event.target.value)}
  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
>
  <option value="">Select Category</option>

  {categories.map((item) => (
    <option key={item.id} value={item.name}>
      {item.name}
    </option>
  ))}
</select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Type
              </label>

              <select
  value={type}
  onChange={(event) => setType(event.target.value)}
  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
>
  <option value="">Select Type</option>

  {types.map((item) => (
    <option key={item.id} value={item.name}>
      {item.name}
    </option>
  ))}
</select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Article Content
              </label>

            <div data-color-mode="light">
  <MDEditor
    value={content}
    onChange={(value) => setContent(value || "")}
    height={500}
    preview="edit"
  />
</div>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3">

            <Link
              href="/dashboard/articles"
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Article"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}