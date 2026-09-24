"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-xl font-bold text-blue-700">
              HITOP CMS
            </h1>

            <p className="text-xs text-slate-500">
              Hotel IT Operating Procedure
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Logout
          </Link>

        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* Welcome */}
        <div className="text-center">

          <h2 className="text-4xl font-bold text-slate-900">
            Welcome to HITOP CMS
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Manage your Hotel IT documentation, SOPs and knowledge base
            from one place.
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Open Dashboard
          </Link>

        </div>

        {/* Quick Access */}
        <div className="mt-16">

          <h3 className="mb-5 text-lg font-semibold text-slate-900">
            Quick Access
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/dashboard/articles"
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Articles
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage HITOP articles
              </p>
            </Link>

            <Link
              href="/dashboard/categories"
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Categories
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage article categories
              </p>
            </Link>

            <Link
              href="/dashboard/types"
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Article Types
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage article types
              </p>
            </Link>

            <Link
              href="/dashboard/media"
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
            >
              <p className="font-semibold text-slate-900">
                Media
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Manage uploaded media
              </p>
            </Link>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-400">
        HITOP CMS · Hotel IT Operating Procedure
      </footer>

    </main>
  );
}