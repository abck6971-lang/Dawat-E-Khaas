import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to avoid overwrites
    const ext = file.name.split('.').pop() || 'png';
    const uniqueName = `${randomBytes(8).toString('hex')}-${Date.now()}.${ext}`;

    // Save to public/uploads
    const path = join(process.cwd(), 'public/uploads', uniqueName);
    await writeFile(path, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error('[Upload Error]', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
