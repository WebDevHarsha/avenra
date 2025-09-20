import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    console.log('Parsed form data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      userId: userId
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload PDF or image files only.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${userId}/${timestamp}_${sanitizedFileName}`;

    // Create storage reference
    const storageRef = ref(storage, `pitch-decks/${fileName}`);
    console.log('Created storage reference for:', `pitch-decks/${fileName}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('File converted to buffer, size:', buffer.length);

    // Upload file to Firebase Storage
    console.log('Starting Firebase upload...');
    const uploadResult = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
    console.log('Firebase upload completed successfully');

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // Return success response with file info
    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadURL,
        storagePath: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}