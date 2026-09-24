"use client";

import { useEffect, useState } from "react";

type ArticleType = {
  id: string;
  name: string;
  section: string;
};

export default function TypesPage() {
  const [types, setTypes] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTypes() {
      try {
        const response = await fetch("/api/types");

        if (!response.ok) {
          throw new Error("Failed to load article types");
        }

        const data = await response.json();

        setTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTypes();
  }, []);

  return (
    <div>

      <header className="border-b border-slate-200 bg-white px-8 py-6">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Article Types
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the types used by HITOP articles.
            </p>

          </div>

          <button
  type="button"
  onClick={() => {
    window.location.href = "/dashboard/types/new";
  }}
  className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
>
  + Add Type
</button>

        </div>

      </header>

      <div className="p-8">

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          <table className="w-full text-left">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Type
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                  Section
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Loading article types...
                  </td>
                </tr>

              ) : types.length === 0 ? (

                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    No article types found.
                  </td>
                </tr>

              ) : (

                types.map((type) => (

                  <tr
                    key={type.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-6 py-5">

                      <p className="font-semibold text-slate-900">
                        {type.name}
                      </p>

                    </td>

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {type.section}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-right">

                     <button
  type="button"
  onClick={() => {
    window.location.href =
      `/dashboard/types/edit?id=${encodeURIComponent(type.id)}`;
  }}
  className="mr-4 text-sm font-semibold text-blue-700 hover:text-blue-900"
>
  Edit
</button>

                     <button
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${type.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/types?id=${encodeURIComponent(type.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete article type."
        );
      }

      window.location.reload();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete article type."
      );
    }
  }}
  className="text-sm font-semibold text-red-600 hover:text-red-800"
>
  Delete
</button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}