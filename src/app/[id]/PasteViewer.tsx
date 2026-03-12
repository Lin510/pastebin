"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import hljs from "highlight.js";
import { Check, Clock, ChevronLeft, ChevronRight, Copy, FileText, Link2, Plus } from "lucide-react";

interface Props {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
  partIndex: number | null;
  totalParts: number | null;
  prevId: string | null;
  nextId: string | null;
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

export default function PasteViewer({ id, title, content, language, createdAt, expiresAt, partIndex, totalParts, prevId, nextId }: Props) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  useEffect(() => {
    // Încarcă tema highlight.js în funcție de temă
    const existingLink = document.getElementById("hljs-theme") as HTMLLinkElement | null;
    const href = isDark
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

    if (existingLink) {
      existingLink.href = href;
    } else {
      const link = document.createElement("link");
      link.id = "hljs-theme";
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [isDark]);

  useEffect(() => {
    if (codeRef.current) {
      delete codeRef.current.dataset.highlighted;
      codeRef.current.textContent = content;
      if (language !== "plaintext" && content.length < 100_000) {
        hljs.highlightElement(codeRef.current);
      }
    }
  }, [content, language]);

  function copyToClipboard() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Part navigation */}
      {totalParts && totalParts > 1 && (
        <div className="flex items-center justify-between mb-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 text-sm">
          <a
            href={prevId ? `/${prevId}` : undefined}
            aria-disabled={!prevId}
            className={`flex items-center gap-1 font-medium transition-colors ${
              prevId
                ? "text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
                : "text-amber-300 dark:text-amber-700 pointer-events-none"
            }`}
          >
            <ChevronLeft size={16} /> Anterioară
          </a>
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            Partea {(partIndex ?? 0) + 1} din {totalParts}
          </span>
          <a
            href={nextId ? `/${nextId}` : undefined}
            aria-disabled={!nextId}
            className={`flex items-center gap-1 font-medium transition-colors ${
              nextId
                ? "text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200"
                : "text-amber-300 dark:text-amber-700 pointer-events-none"
            }`}
          >
            Următoare <ChevronRight size={16} />
          </a>
        </div>
      )}
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title || <span className="text-gray-400 dark:text-gray-500 italic">Fără titlu</span>}
          </h1>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(createdAt)}</span>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-mono">{language}</span>
            {expiresAt && (
              <span className="text-amber-600 dark:text-amber-500 flex items-center gap-1"><Clock size={12} /> Expiră {formatDate(expiresAt)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            {copied ? "Copiat!" : "Link"}
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Copy size={13} />
            Copiază cod
          </button>
          <a
            href={`/${id}/raw`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <FileText size={13} />
            Raw
          </a>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Paste nou
          </Link>
        </div>
      </div>

      {/* Code block */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{id}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600">{content.length.toLocaleString()} caractere</span>
        </div>
        <pre className="overflow-y-auto overflow-x-hidden text-sm leading-relaxed max-h-[75vh] whitespace-pre-wrap break-words">
          <code ref={codeRef} className={`language-${language} hljs`} />
        </pre>
      </div>
    </div>
  );
}
