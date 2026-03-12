import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Paste from "@/models/Paste";
import PasteViewer from "./PasteViewer";
import PasswordGate from "./PasswordGate";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) {
    notFound();
  }

  await connectDB();
  const paste = await Paste.findOne({ pasteId: id }).lean();

  if (!paste) notFound();

  if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-4xl mb-4">⏰</p>
        <h1 className="text-xl font-semibold text-gray-300 mb-2">Paste expirat</h1>
        <p className="text-gray-500">Acest paste nu mai este disponibil.</p>
        <a href="/" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 transition-colors text-sm">
          ← Creează un paste nou
        </a>
      </div>
    );
  }

  if (paste.passwordHash) {
    return (
      <PasswordGate
        meta={{
          id: paste.pasteId,
          title: paste.title ?? "",
          language: paste.language ?? "plaintext",
          createdAt: paste.createdAt?.toISOString() ?? "",
          expiresAt: paste.expiresAt?.toISOString() ?? null,
        }}
      />
    );
  }

  return (
    <PasteViewer
      id={paste.pasteId}
      title={paste.title ?? ""}
      content={paste.content}
      language={paste.language ?? "plaintext"}
      createdAt={paste.createdAt?.toISOString() ?? ""}
      expiresAt={paste.expiresAt?.toISOString() ?? null}
    />
  );
}
