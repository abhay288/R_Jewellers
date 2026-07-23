import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ImportService } from '@/backend/services/ImportService';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const formData = await req.formData();
    const dataFile = formData.get('file') as File | null;
    const zipFile = formData.get('zip') as File | null;
    const action = (formData.get('action') as string) || 'execute'; // 'validate' | 'execute'
    const autoCreateCategory = formData.get('autoCreateCategory') !== 'false';

    if (!dataFile) {
      return NextResponse.json({ error: 'Data file (CSV or Excel) is required.' }, { status: 400 });
    }

    const dataBuffer = Buffer.from(await dataFile.arrayBuffer());
    const rows = await ImportService.parseDataFile(dataBuffer, dataFile.type, dataFile.name);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file is empty or invalid.' }, { status: 400 });
    }

    // Step 1: Pre-validate rows
    const validation = await ImportService.validateRows(rows);

    if (action === 'validate') {
      return NextResponse.json({
        success: true,
        validation,
      });
    }

    // Parse ZIP file if provided
    let mediaFiles: { images: Map<string, { buffer: Buffer; name: string }>; videos: Map<string, { buffer: Buffer; name: string }> } | undefined = undefined;
    if (zipFile) {
      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      mediaFiles = await ImportService.parseZipFile(zipBuffer);
    }

    // Parse direct JPG/JPEG/PNG/WEBP image files if provided
    const directImageFiles = formData.getAll('images') as File[];
    if (directImageFiles && directImageFiles.length > 0) {
      if (!mediaFiles) {
        mediaFiles = { images: new Map(), videos: new Map() };
      }
      for (const imgFile of directImageFiles) {
        if (imgFile && typeof imgFile === 'object' && imgFile.size > 0) {
          const imgBuf = Buffer.from(await imgFile.arrayBuffer());
          mediaFiles.images.set(imgFile.name.toLowerCase(), {
            buffer: imgBuf,
            name: imgFile.name
          });
        }
      }
    }

    // Step 2: Execute Import Pipeline
    const sessionId = crypto.randomUUID();
    const result = await ImportService.executeImport(sessionId, rows, mediaFiles, autoCreateCategory);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Import API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during import process' }, { status: 500 });
  }
}
