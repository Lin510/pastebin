"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import hljs from "highlight.js";
import { Check, Clock, Copy, FileText, Link2, Plus } from "lucide-react";

interface Props {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
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

export default function PasteViewer({ id, title, content, language, createdAt, expiresAt }: Props) {
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
      if (language !== "plaintext") {
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
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Paste nou
          </a>
        </div>
      </div>

      {/* Code block */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{id}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600">{content.length.toLocaleString()} caractere</span>
        </div>
        <pre className="overflow-auto text-sm leading-relaxed max-h-[75vh]">
          <code ref={codeRef} className={`language-${language} hljs`} />
        </pre>
      </div>
    </div>
  );
}
