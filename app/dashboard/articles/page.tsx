"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Article = {
  id: string;
  title: string;
  category: string;
  type: string;
  status: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch("/api/articles");

        if (!response.ok) {
          throw new Error("Failed to load articles");
        }

        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.toLowerCase().trim();

   if (!query) {
  return [...articles].sort((a, b) => {
   const dateA = a.updated_at
  ? new Date(a.updated_at).getTime()
  : 0;

const dateB = b.updated_at
  ? new Date(b.updated_at).getTime()
  : 0;

    return dateB - dateA;
  });
}

    return articles
  .filter((article) =>
    [
      article.title,
      article.category,
      article.type,
      article.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  )
  .sort((a, b) => {
  const dateA = a.updated_at
  ? new Date(a.updated_at).getTime()
  : 0;

const dateB = b.updated_at
  ? new Date(b.updated_at).getTime()
  : 0;

    return dateB - dateA;
  });
}, [articles, search]);

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            {/* HITOP Shield */}
            <svg
              width="34"
              height="38"
              viewBox="0 0 48 54"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 2 L44 9 V25 C44 38 36 47 24 52 C12 47 4 38 4 25 V9 Z"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              <path
                d="M14 27 L21 34 L35 19"
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div>
              <div className="text-lg font-bold">
                HITOP CMS
              </div>

              <div className="text-xs text-blue-100">
                Hotel IT Operating Procedure
              </div>
            </div>
          </Link>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500">
            Logout
          </button>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Articles
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your HITOP knowledge base articles.
            </p>
          </div>

          <Link
            href="/articles/new"
            className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            + New Article
          </Link>

        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <table className="w-full">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Article
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Type
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                  Updated
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr key="loading">
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Loading articles...
                  </td>
                </tr>

              ) : filteredArticles.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No articles found.
                  </td>
                </tr>

              ) : (

                filteredArticles.map((article) => (

                 <tr
  key={article.id}
  className="border-b border-slate-100 hover:bg-slate-50"
>

                    <td className="px-6 py-5">

                      <div className="font-semibold text-slate-900">
                        {article.title}
                      </div>

                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {article.category}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {article.type}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={
                          article.status === "Published"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                            : "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                        }
                      >
                        {article.status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(article.updated_at)}
                    </td>

                    <td className="px-6 py-5 text-right">
  <div className="flex justify-end gap-4">
    <Link
      href={`/articles/edit?id=${encodeURIComponent(article.id)}`}
      className="text-sm font-semibold text-blue-700 hover:text-blue-900"
    >
      Edit
    </Link>

    <button
      type="button"
      onClick={async () => {
        const confirmed = window.confirm(
          `Are you sure you want to delete "${article.title}"?`
        );

        if (!confirmed) {
          return;
        }

        try {
          const response = await fetch(
            `/api/articles?id=${encodeURIComponent(article.id)}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error || "Failed to delete article."
            );
          }

          window.location.reload();
        } catch (error) {
          window.alert(
            error instanceof Error
              ? error.message
              : "Failed to delete article."
          );
        }
      }}
      className="text-sm font-semibold text-red-600 hover:text-red-800"
    >
      Delete
    </button>
  </div>
</td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}
