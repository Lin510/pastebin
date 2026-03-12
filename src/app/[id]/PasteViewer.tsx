"use client";

import { useEffect, useRef, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

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

  useEffect(() => {
    if (codeRef.current) {
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
          <h1 className="text-xl font-semibold text-white">
            {title || <span className="text-gray-500 italic">Fără titlu</span>}
          </h1>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span>🕐 {formatDate(createdAt)}</span>
            <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">{language}</span>
            {expiresAt && (
              <span className="text-amber-500">⏰ Expiră {formatDate(expiresAt)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            {copied ? "✓ Copiat!" : "🔗 Link"}
          </button>
          <button
            onClick={copyToClipboard}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            📋 Copiază cod
          </button>
          <a
            href="/"
            className="text-xs bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Paste nou
          </a>
        </div>
      </div>

      {/* Code block */}
      <div className="relative rounded-xl overflow-hidden border border-gray-800">
        <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
          <span className="text-xs text-gray-500 font-mono">{id}</span>
          <span className="text-xs text-gray-600">{content.length.toLocaleString()} caractere</span>
        </div>
        <pre className="overflow-auto text-sm leading-relaxed max-h-[75vh] bg-[#0d1117]">
          <code ref={codeRef} className={`language-${language} hljs`} />
        </pre>
      </div>
    </div>
  );
}
