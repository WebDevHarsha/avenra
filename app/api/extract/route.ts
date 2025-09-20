import { NextRequest, NextResponse } from 'next/server';
import FirecrawlApp from '@mendable/firecrawl-js';

export async function POST(request: NextRequest) {
  try {
    const { url, fileBuffer } = await request.json();
    console.log('Extract API called with:', { 
      hasUrl: !!url, 
      hasFileBuffer: !!fileBuffer,
      fileBufferLength: fileBuffer ? fileBuffer.length : 0
    });
    
    let extractionResult;

    if (url) {
      console.log('Processing URL extraction for:', url);
      
      if (!process.env.FIRECRAWLER_API) {
        return NextResponse.json(
          { success: false, error: 'FireCrawler API key not configured' },
          { status: 500 }
        );
      }

      try {
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWLER_API });
        
        console.log('Scraping URL with FireCrawler SDK...');
        const scrapeResult = await firecrawl.scrapeUrl(url, {
          formats: ['markdown'],
          onlyMainContent: true
        });

        console.log('FireCrawler scrape result success:', scrapeResult.success);

        if (!scrapeResult.success) {
          return NextResponse.json(
            { success: false, error: 'Failed to scrape URL', details: (scrapeResult as any).error },
            { status: 500 }
          );
        }

        // Type assertion for successful response
        const successResult = scrapeResult as any;
        
        extractionResult = {
          success: true,
          data: {
            text: successResult.markdown || successResult.html || '',
            metadata: successResult.metadata || {}
          }
        };
      } catch (urlError) {
        console.error('URL extraction error:', urlError);
        const errorMessage = urlError instanceof Error ? urlError.message : 'Unknown URL extraction error';
        return NextResponse.json(
          { success: false, error: 'Failed to extract from URL', details: errorMessage },
          { status: 500 }
        );
      }
    } else if (fileBuffer) {
      // Real PDF text extraction using pdf-parse
      try {
        console.log('Processing PDF file with real extraction...');
        
        const buffer = Buffer.from(fileBuffer, 'base64');
        console.log('PDF buffer size:', buffer.length);
        
        // Use require() instead of import() to avoid the test file issue
        const pdfParse = require('pdf-parse');
        
        console.log('Starting PDF parsing...');
        const pdfData = await pdfParse(buffer);
        
        console.log('PDF parsing completed:', {
          pages: pdfData.numpages,
          textLength: pdfData.text ? pdfData.text.length : 0
        });
        
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          throw new Error('No text content found in PDF. The PDF might be image-based or encrypted.');
        }
        
        extractionResult = {
          success: true,
          data: {
            text: pdfData.text.trim(),
            metadata: {
              pages: pdfData.numpages,
              fileSize: buffer.length,
              extractionMethod: 'pdf-parse',
              info: pdfData.info || {}
            }
          }
        };
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown PDF processing error';
        return NextResponse.json(
          { success: false, error: 'Failed to process PDF file', details: errorMessage },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Either URL or file buffer is required' },
        { status: 400 }
      );
    }

    // Since we're only doing local PDF extraction now, extractionResult is always our format
    return NextResponse.json(extractionResult);

  } catch (error) {
    console.error('FireCrawler extraction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during extraction' },
      { status: 500 }
    );
  }
}