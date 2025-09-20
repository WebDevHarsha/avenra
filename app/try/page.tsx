"use client";

import React, { useState } from 'react';

const PDFTextExtractor: React.FC = () => {
  const [pdfText, setPdfText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);

      // Dynamically load pdf.js script
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js';
      script.onload = async () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((s: any) => s.str).join(' ');
        }
        setPdfText(text);
        setLoading(false);
      };
      document.body.appendChild(script);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
      {loading && <p>Loading...</p>}
      <pre>{pdfText}</pre>
    </div>
  );
};

export default PDFTextExtractor;
