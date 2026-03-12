import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Paste from '@/models/Paste';

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Neautorizat' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = 20;
    const skip = (page - 1) * limit;

    await connectDB();

    const [pastes, total] = await Promise.all([
      Paste.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('pasteId title language expiresAt createdAt passwordHash')
        .lean(),
      Paste.countDocuments(),
    ]);

    return NextResponse.json({
      pastes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: 'Eroare internă server' }, { status: 500 });
  }
}
