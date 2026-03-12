"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

function subscribe() {
  return () => {};
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) return <div className="w-9 h-9" />;

  type Option = { value: string; icon: React.ReactNode; label: string };
  const options: Option[] = [
    { value: "light", icon: <Sun size={16} />, label: "Light" },
    { value: "dark", icon: <Moon size={16} />, label: "Dark" },
    { value: "system", icon: <Monitor size={16} />, label: "System" },
  ];

  const current = options.find((o) => o.value === theme) ?? options[2];
  const next = options[(options.indexOf(current) + 1) % options.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      title={`Temă: ${current.label} → ${next.label}`}
      className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
    >
      {current.icon}
    </button>
  );
}
