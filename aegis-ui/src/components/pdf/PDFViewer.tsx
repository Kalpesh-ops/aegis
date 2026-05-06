"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  fileUrl: string;
  pageNumber?: number;
  onLoadSuccess?: (numPages: number) => void;
  onScaleCalculated?: (scale: number) => void;
  children?: React.ReactNode;
}

export default function PDFViewer({ 
  fileUrl, 
  pageNumber = 1, 
  onLoadSuccess,
  onScaleCalculated,
  children 
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    onLoadSuccess?.(numPages);
  }

  function onPageLoadSuccess(page: any) {
    const { width, originalWidth } = page;
    const calculatedScale = width / originalWidth;
    onScaleCalculated?.(calculatedScale);
  }

  return (
    <div className="flex flex-col items-center bg-gray-100 p-4 h-full overflow-auto rounded-lg shadow-inner">
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="shadow-lg"
        loading={<div className="flex items-center justify-center h-64">Loading PDF...</div>}
      >
        <div className="relative">
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            onLoadSuccess={onPageLoadSuccess}
            className="max-w-full"
            scale={1.2}
          />
          {children}
        </div>
      </Document>
      <div className="mt-4 text-sm text-gray-600">
        Page {pageNumber} of {numPages}
      </div>
    </div>
  );
}
