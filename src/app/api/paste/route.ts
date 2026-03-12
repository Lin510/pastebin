import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/mongodb';
import Paste from '@/models/Paste';

const ALLOWED_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp',
  'csharp', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
  'json', 'yaml', 'xml', 'sql', 'bash', 'shell', 'markdown', 'dockerfile',
];

const EXPIRY_OPTIONS: Record<string, number> = {
  '10m': 10 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  'never': 0,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, language, expiry } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Conținutul este obligatoriu' }, { status: 400 });
    }

    if (content.length > 500_000) {
      return NextResponse.json({ error: 'Conținutul depășește limita de 500KB' }, { status: 400 });
    }

    const sanitizedLanguage =
      typeof language === 'string' && ALLOWED_LANGUAGES.includes(language)
        ? language
        : 'plaintext';

    const sanitizedTitle =
      typeof title === 'string' ? title.slice(0, 200).trim() : '';

    let expiresAt: Date | null = null;
    if (expiry && expiry !== 'never' && EXPIRY_OPTIONS[expiry]) {
      expiresAt = new Date(Date.now() + EXPIRY_OPTIONS[expiry]);
    }

    await connectDB();

    const pasteId = nanoid(8);

    const paste = await Paste.create({
      pasteId,
      title: sanitizedTitle,
      content,
      language: sanitizedLanguage,
      expiresAt,
    });

    return NextResponse.json({ id: paste.pasteId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}
