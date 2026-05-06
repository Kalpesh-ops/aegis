'use client';

import React from 'react';

interface HighlightOverlayProps {
  bbox: [number, number, number, number] | null;
  pdfScale: number; // calculated as renderedWidth / originalPdfWidth
}

export function HighlightOverlay({ bbox, pdfScale }: HighlightOverlayProps) {
  if (!bbox) return null;

  const [x0, y0, x1, y1] = bbox;
  
  // Translate absolute coordinates to scaled CSS positioning
  // PyMuPDF uses points (1/72 inch), where (0,0) is bottom-left for some and top-left for others.
  // Standard PDF coordinate system is bottom-left, but many parsers normalize to top-left.
  // Assuming top-left here as per standard web mapping.
  const style = {
    left: `${x0 * pdfScale}px`,
    top: `${y0 * pdfScale}px`,
    width: `${(x1 - x0) * pdfScale}px`,
    height: `${(y1 - y0) * pdfScale}px`,
  };

  return (
    <div
      className="absolute bg-yellow-300/40 border-2 border-yellow-500 rounded-sm pointer-events-none transition-all duration-300 z-10"
      style={style}
    />
  );
}
