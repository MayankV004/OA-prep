import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { withRole } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function detectImageExtension(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return '.png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return '.jpg';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return '.webp';
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return '.gif';
  }

  return null;
}

export async function POST(req: NextRequest) {
  // SEC-02 Fix: Restrict image upload to administrators only
  return withRole(req, 'admin', async ({ userId }) => {
    // Rate limit upload requests: max 10 per minute per admin
    const rateLimit = await checkRateLimit(req, {
      keyPrefix: `upload:${userId}`,
      max: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: { message: 'No file provided' } }, { status: 400 });
      }

      // Enforce 2 MB maximum file size limit
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: { message: 'File size exceeds maximum allowed limit of 2MB.' } },
          { status: 413 }
        );
      }

      // Read file buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Verify magic bytes (content-based validation, ignoring client-provided headers)
      const verifiedExt = detectImageExtension(buffer);
      if (!verifiedExt) {
        return NextResponse.json(
          {
            error: {
              message: 'Invalid file signature. Only authentic PNG, JPEG, WebP, and GIF images are permitted.',
            },
          },
          { status: 400 }
        );
      }

      // Generate cryptographically random non-guessable filename with verified extension
      const safeFilename = `${crypto.randomUUID()}${verifiedExt}`;

      // Create uploads directory in public folder if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, safeFilename);

      // Save file to disk
      await writeFile(filePath, buffer);

      const url = `/uploads/${safeFilename}`;
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
