"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import PasteViewer from "./PasteViewer";

interface PasteMeta {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
}

interface PasteData extends PasteMeta {
  content: string;
}

export default function PasswordGate({ meta }: { meta: PasteMeta }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState<PasteData | null>(null);

  async function handleUnlock() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/paste/${meta.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Parolă incorectă");
        return;
      }
      setPaste(data);
    } catch {
      setError("Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  }

  if (paste) {
    return (
      <PasteViewer
        id={paste.id}
        title={paste.title}
        content={paste.content}
        language={paste.language}
        createdAt={paste.createdAt}
        expiresAt={paste.expiresAt}
        partIndex={null}
        totalParts={null}
        prevId={null}
        nextId={null}
      />
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-full mb-4">
          <Lock size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {meta.title || "Paste protejat"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Introdu parola pentru a vizualiza conținutul.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleUnlock(); }} className="space-y-3">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă..."
            autoFocus
            autoComplete="new-password"
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors"
        >
          {loading ? "Se verifică..." : "Deblochează"}
        </button>
      </form>
    </div>
  );
}
