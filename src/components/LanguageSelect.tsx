"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search,
  FileText, Braces, Code2, Coffee, Gem, Globe, Palette,
  Database, Terminal, FileCode, Package, FileJson2
} from "lucide-react";

export interface LangOption {
  value: string;
  label: string;
}

const ICONS: Record<string, React.ReactNode> = {
  plaintext:   <FileText size={15} />,
  javascript:  <Braces size={15} />,
  typescript:  <Braces size={15} />,
  python:      <Code2 size={15} />,
  java:        <Coffee size={15} />,
  c:           <Code2 size={15} />,
  cpp:         <Code2 size={15} />,
  csharp:      <Code2 size={15} />,
  php:         <Code2 size={15} />,
  ruby:        <Gem size={15} />,
  go:          <Code2 size={15} />,
  rust:        <Code2 size={15} />,
  swift:       <Code2 size={15} />,
  kotlin:      <Code2 size={15} />,
  html:        <Globe size={15} />,
  css:         <Palette size={15} />,
  json:        <FileJson2 size={15} />,
  yaml:        <FileCode size={15} />,
  xml:         <FileCode size={15} />,
  sql:         <Database size={15} />,
  bash:        <Terminal size={15} />,
  markdown:    <FileText size={15} />,
  dockerfile:  <Package size={15} />,
};

interface Props {
  options: LangOption[];
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setSearch(""); }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(""); }}
        className="w-full flex items-center justify-between gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
      >
        <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          {ICONS[current.value] ?? <Code2 size={15} />}
          <span className="text-gray-900 dark:text-gray-100">{current.label}</span>
        </span>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută limbaj..."
              className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
          </div>

          {/* Options */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-600">Niciun rezultat</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setSearch(""); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left
                      ${o.value === value
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                  >
                    <span className="text-gray-400 dark:text-gray-500">
                      {ICONS[o.value] ?? <Code2 size={15} />}
                    </span>
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
