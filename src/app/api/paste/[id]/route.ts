import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Acest paste a expirat' }, { status: 410 });
    }

    // Paste protejat cu parolă — returnăm doar metadate
    if (paste.passwordHash) {
      return NextResponse.json({
        id: paste.pasteId,
        title: paste.title,
        language: paste.language,
        expiresAt: paste.expiresAt,
        createdAt: paste.createdAt,
        passwordProtected: true,
      });
    }

    return NextResponse.json({
      id: paste.pasteId,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      expiresAt: paste.expiresAt,
      createdAt: paste.createdAt,
      passwordProtected: false,
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) {
      return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
    }

    const body = await request.json();
    const { password } = body;

    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Parolă invalidă' }, { status: 400 });
    }

    await connectDB();

    const paste = await Paste.findOne({ pasteId: id }).lean();

    if (!paste) {
      return NextResponse.json({ error: 'Paste negăsit' }, { status: 404 });
    }

    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Acest paste a expirat' }, { status: 410 });
    }

    if (!paste.passwordHash) {
      return NextResponse.json({ error: 'Paste-ul nu este protejat' }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, paste.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Parolă incorectă' }, { status: 401 });
    }

    return NextResponse.json({
      id: paste.pasteId,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      expiresAt: paste.expiresAt,
      createdAt: paste.createdAt,
      passwordProtected: true,
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}

