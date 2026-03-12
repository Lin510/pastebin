import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!id || !/^[A-Za-z0-9_-]{8}$/.test(id)) {
      return NextResponse.json({ error: 'ID invalid' }, { status: 400 });
    }

    await connectDB();

    const result = await Paste.deleteOne({ pasteId: id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Paste negăsit' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}
