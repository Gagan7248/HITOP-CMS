"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "▪",
  },
  {
    name: "Articles",
    href: "/dashboard/articles",
    icon: "▸",
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: "▪",
  },
  {
    name: "Article Types",
    href: "/dashboard/types",
    icon: "◇",
  },
  {
    name: "Media",
    href: "/dashboard/media",
    icon: "▣",
  },
  {
    name: "Backup",
    href: "/dashboard/backup",
    icon: "◫",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: "⚙",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >

        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">

          <div
            className={`overflow-hidden transition-all duration-300 ${
              sidebarOpen
                ? "w-auto opacity-100"
                : "w-0 opacity-0"
            }`}
          >
            <div className="whitespace-nowrap text-xl font-bold text-blue-700">
              HITOP CMS
            </div>

            <div className="whitespace-nowrap text-xs text-slate-500">
              Hotel IT Operating Procedure
            </div>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            title={
              sidebarOpen
                ? "Collapse sidebar"
                : "Expand sidebar"
            }
          >
            {sidebarOpen ? "‹" : "›"}
          </button>

        </div>

        {/* Navigation */}
        <nav className="p-4">

          {sidebarOpen && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Management
            </p>
          )}

          <div className="space-y-1">

            {navigation.map((item) => {

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    sidebarOpen
                      ? "gap-3"
                      : "justify-center"
                  } ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >

                  <span className="w-5 shrink-0 text-center">
                    {item.icon}
                  </span>

                  {sidebarOpen && (
                    <span className="whitespace-nowrap">
                      {item.name}
                    </span>
                  )}

                </Link>
              );

            })}

          </div>

        </nav>

        {/* Bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4">

          <Link
            href="/login"
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
              sidebarOpen
                ? "gap-3"
                : "justify-center"
            }`}
          >

            <span className="w-5 shrink-0 text-center">
              ↪
            </span>

            {sidebarOpen && (
              <span className="whitespace-nowrap">
                Logout
              </span>
            )}

          </Link>

        </div>

      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen
            ? "pl-64"
            : "pl-20"
        }`}
      >

        <main className="min-h-screen">
          {children}
        </main>

      </div>

    </div>
  );
}