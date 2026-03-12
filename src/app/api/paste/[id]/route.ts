import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) {
      return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
    }

    await connectDB();

    const paste = await Paste.findOne({ pasteId: id }).lean();

    if (!paste) {
      return NextResponse.json({ error: 'Paste negăsit' }, { status: 404 });
    }

    // Verificăm expirarea manual (TTL index poate întârzia cu câteva minute)
    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Acest paste a expirat' }, { status: 410 });
    }

    return NextResponse.json({
      id: paste.pasteId,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      expiresAt: paste.expiresAt,
      createdAt: paste.createdAt,
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}
