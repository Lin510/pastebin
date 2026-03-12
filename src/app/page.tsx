"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { LanguageSelect, type LangOption } from "@/components/LanguageSelect";

const LANGUAGES: LangOption[] = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash / Shell" },
  { value: "markdown", label: "Markdown" },
  { value: "dockerfile", label: "Dockerfile" },
];

const EXPIRY_OPTIONS = [
  { value: "never", label: "Niciodată" },
  { value: "10m", label: "10 minute" },
  { value: "1h", label: "1 oră" },
  { value: "1d", label: "1 zi" },
  { value: "7d", label: "7 zile" },
  { value: "30d", label: "30 zile" },
];

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiry, setExpiry] = useState("never");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [useProtect, setUseProtect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");

  const CHUNK_SIZE = 1_000_000;

  async function handleSubmit() {
    setError("");

    if (!content.trim()) {
      setError("Conținutul nu poate fi gol.");
      return;
    }

    setLoading(true);
    try {
      const chunks: string[] = [];
      for (let i = 0; i < content.length; i += CHUNK_SIZE) {
        chunks.push(content.slice(i, i + CHUNK_SIZE));
      }

      const groupId = chunks.length > 1 ? crypto.randomUUID() : null;
      const totalParts = chunks.length > 1 ? chunks.length : null;
      let firstId: string | null = null;

      for (let i = 0; i < chunks.length; i++) {
        if (chunks.length > 1) setLoadingMsg(`Se creează partea ${i + 1}/${chunks.length}...`);
        else setLoadingMsg("Se creează...");

        const res = await fetch("/api/paste", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
            content: chunks[i],
            language,
            expiry,
            password: useProtect && password ? password : undefined,
            groupId,
            partIndex: groupId !== null ? i : null,
            totalParts,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Eroare la creare paste.");
          return;
        }

        if (i === 0) firstId = data.id as string;
      }

      router.push(`/${firstId}`);
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Paste nou</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Partajează cod sau text printr-un link unic.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="space-y-4">
        {/* Titlu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titlu <span className="text-gray-400 dark:text-gray-500">(opțional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="ex: Config nginx, Snippet React..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Conținut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Conținut <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder="Lipește codul sau textul tău aici..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
            required
          />
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 text-right">
            {content.length.toLocaleString()} caractere
            {content.length > 1_000_000 && (
              <span className="ml-2 text-amber-500 dark:text-amber-400">
                → {Math.ceil(content.length / 1_000_000)} părți
              </span>
            )}
          </p>
        </div>

        {/* Limbaj + Expirare */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Limbaj
            </label>
            <LanguageSelect
              options={LANGUAGES}
              value={language}
              onChange={setLanguage}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiră după
            </label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Protejare cu parolă */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setUseProtect((v) => {
                if (v) { setPassword(""); setShowPassword(false); }
                return !v;
              });
            }}
            className="flex items-center gap-2.5 w-fit"
          >
            <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
              useProtect ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            }`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                useProtect ? "translate-x-4" : "translate-x-0"
              }`} />
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 select-none">
              <Lock size={14} className="text-gray-400" />
              Protejează cu parolă
            </span>
          </button>

          {useProtect && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={200}
                autoFocus
                autoComplete="new-password"
                placeholder="Parolă..."
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
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-2.5 rounded-lg transition-colors"
        >
          {loading ? (loadingMsg || "Se creează...") : "Creează Paste"}
        </button>
      </form>
    </div>
  );
}
