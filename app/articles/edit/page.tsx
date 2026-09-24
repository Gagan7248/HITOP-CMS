"use client";

import Link from "next/link";
import MDEditor from "@uiw/react-md-editor";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Article = {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function EditArticlePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [article, setArticle] = useState<Article | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [section, setSection] = useState("documentation");
const [categories, setCategories] = useState<
  { id: string; name: string }[]
>([]);

const [types, setTypes] = useState<
  { id: string; name: string }[]
>([]);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");
const [showMedia, setShowMedia] = useState(false);
const [media, setMedia] = useState<
  { id: string; filename: string; url: string; mime_type: string }[]
>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadArticle() {
      if (!id) {
        setError("Article ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/articles?id=${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load article."
          );
        }

        setArticle(data);

        setTitle(data.title || "");
	      setDescription(data.description || "");
        setSection(data.section || "documentation");
        setCategory(data.category || "");
        setType(data.type || "How-to Guide");
        setStatus(data.status || "Draft");
        setContent(data.content || "");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load article."
        );
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id]);

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
    } catch (error) {
      console.error("Failed to load categories/types:", error);
    }
  }

  loadOptions();
}, [section]);


useEffect(() => {
  async function loadMedia() {
    try {
      const response = await fetch("/api/media");
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setMedia(data);
      }
    } catch (error) {
      console.error("Failed to load media:", error);
    }
  }

  loadMedia();
}, []);
  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  if (!id) {
    setError("Article ID is missing.");
    return;
  }

  if (!title.trim() || !content.trim()) {
    setError("Title and content are required.");
    return;
  }

  setSaving(true);
  setError("");

  try {
    const response = await fetch("/api/articles", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: title.trim(),
        description: description.trim(),
        section,
        category,
        type,
        status,
        content: content.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to update article."
      );
    }

    router.push("/dashboard/articles");
    router.refresh();
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to update article."
    );
  } finally {
    setSaving(false);
  }
}

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading article...
          </div>
        </div>
      </main>
    );
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
            Edit Article
          </h1>

          <p className="mt-2 text-slate-500">
            Update your HITOP knowledge base article.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

{showMedia && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
    <div className="max-h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Select Media
        </h2>

        <button
          type="button"
          onClick={() => setShowMedia(false)}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto p-6">

        {media.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No media found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
  const imageMarkdown =
    `![${item.filename}](${item.url})`;

console.log("IMAGE MARKDOWN:", imageMarkdown);
  setContent(
    content
      ? `${content}\n\n${imageMarkdown}\n`
      : `${imageMarkdown}\n`
  );

  setShowMedia(false);
}}              className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left hover:border-blue-500 hover:shadow-md"
              >
                <div className="aspect-video bg-slate-100">

                  {item.mime_type.startsWith("image/") && (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="h-full w-full object-cover"
                    />
                  )}

                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.filename}
                  </p>
                </div>

              </button>
            ))}

          </div>
        )}

      </div>

    </div>
  </div>
)}

        {article && (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-8 shadow-sm"
          >

            <div className="grid gap-6 md:grid-cols-2">

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Article Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
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
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
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

<button
    type="button"
    onClick={() => setShowMedia(true)}
    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
  >
    Insert Media
  </button>

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
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>
        )}

      </div>

    </main>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditArticlePageContent />
    </Suspense>
  );
}