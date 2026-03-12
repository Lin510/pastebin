"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PasteItem {
  pasteId: string;
  title: string;
  language: string;
  expiresAt: string | null;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pastes, setPastes] = useState<PasteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPastes = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pastes?page=${p}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setPastes(data.pastes ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPastes(1);
  }, [fetchPastes]);

  async function handleDelete(id: string) {
    if (!confirm(`Ștergi paste-ul ${id}?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/paste/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPastes(page);
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} paste{total !== 1 ? "-uri" : ""} total
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            className="text-sm bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Paste nou
          </a>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Se încarcă...</div>
      ) : pastes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-3xl mb-3">📭</p>
          <p>Niciun paste creat încă.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Titlu</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Limbaj</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Creat</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Expiră</th>
                <th className="px-4 py-3 font-medium text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {pastes.map((p) => (
                <tr key={p.pasteId} className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <a
                      href={`/${p.pasteId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {p.pasteId}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-[180px] truncate">
                    {p.title || <span className="text-gray-600 italic">fără titlu</span>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="bg-gray-800 text-gray-400 px-2 py-0.5 rounded text-xs font-mono">
                      {p.language}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs">
                    {p.expiresAt ? (
                      <span className="text-amber-500">{formatDate(p.expiresAt)}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.pasteId)}
                      disabled={deletingId === p.pasteId}
                      className="text-xs text-red-400 hover:text-red-300 disabled:text-red-800 disabled:cursor-not-allowed transition-colors px-2 py-1 rounded hover:bg-red-950"
                    >
                      {deletingId === p.pasteId ? "..." : "Șterge"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => fetchPastes(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm"
          >
            ← Anterior
          </button>
          <span className="px-4 py-2 text-gray-500 text-sm">
            {page} / {pages}
          </span>
          <button
            onClick={() => fetchPastes(page + 1)}
            disabled={page >= pages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors text-sm"
          >
            Următor →
          </button>
        </div>
      )}
    </div>
  );
}
