import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { withAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 });
      }

      // Enforce 5 MB maximum file size limit
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: { message: 'File size exceeds maximum allowed limit of 5MB.' } },
          { status: 413 }
        );
      }

      // Validate image mime type (SVG excluded due to XSS risk)
      const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { error: { message: 'Invalid file type. Only images (PNG, JPEG, WEBP, GIF) are allowed.' } },
          { status: 400 }
        );
      }

      // Read file buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory in public folder if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${cleanFileName}`;
      const filePath = path.join(uploadsDir, filename);

      // Save file to disk
      await writeFile(filePath, buffer);

      const url = `/uploads/${filename}`;
      return NextResponse.json({ url });
    } catch (err: any) {
      console.error('Image upload error:', err);
      return NextResponse.json(
        { error: { message: err.message || 'Failed to upload image' } },
        { status: 500 }
      );
    }
  });
}
