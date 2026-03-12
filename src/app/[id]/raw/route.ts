import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) {
    return new NextResponse('ID invalid', { status: 400 });
  }

  await connectDB();
  const paste = await Paste.findOne({ pasteId: id }).lean();

  if (!paste) {
    return new NextResponse('Paste negăsit', { status: 404 });
  }

  if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
    return new NextResponse('Paste expirat', { status: 410 });
  }

  if (paste.passwordHash) {
    return new NextResponse('Acest paste este protejat cu parolă', { status: 403 });
  }

  return new NextResponse(paste.content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
