"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Article = {
  id?: string;
  title: string;
  category: string;
  type: string;
  status: string;
  updated_at?: string;
};

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles")
      .then((response) => response.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setArticles([]);
      });
  }, []);

  const published = articles.filter(
    (article) => article.status === "Published"
  ).length;

  const drafts = articles.filter(
    (article) => article.status === "Draft"
  ).length;

  const categories = new Set(
    articles.map((article) => article.category)
  ).size;

  const types = new Set(
    articles.map((article) => article.type)
  ).size;

  return (
    <div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Welcome to the HITOP Content Management System.
        </p>
      </header>

      <div className="p-8">

        {/* Statistics */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

          {/* Total Articles */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Total Articles
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {articles.length}
            </p>
          </div>

          {/* Published */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {published}
            </p>
          </div>

          {/* Drafts */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {drafts}
            </p>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Categories
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {categories}
            </p>
          </div>

          {/* Article Types */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Article Types
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {types}
            </p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            <Link
              href="/articles/new"
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Create Article
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create a new HITOP knowledge base article.
              </p>
            </Link>

            <Link
              href="/dashboard/articles"
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Manage Articles
              </p>

              <p className="mt-1 text-sm text-slate-500">
                View, edit and publish existing articles.
              </p>
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Manage Categories
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage article categories.
              </p>
            </Link>

          </div>

        </div>

        {/* Recent Articles */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <h2 className="font-semibold text-slate-900">
              Recent Articles
            </h2>

            <Link
              href="/dashboard/articles"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View Articles →
            </Link>

          </div>

          <div className="divide-y divide-slate-100">

            {articles.slice(0, 5).map((article) => (

              <div
                key={article.id}
                className="flex items-center justify-between px-6 py-4"
              >

                <div>
                  <p className="font-medium text-slate-900">
                    {article.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {article.category} • {article.type}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      article.status === "Published"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {article.status}
                  </span>

                  {article.id && (
                    <Link
                      href={`/articles/edit?id=${encodeURIComponent(article.id)}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  )}

                </div>

              </div>

            ))}

            {articles.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-500">
                No articles found.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}