// Wraps a client-rasterized PNG of the mounting diagram into an A4 PDF.
// The visual is composed and rasterized in the browser (reliable SVG + bracket-asset
// rendering); this function assembles the final PDF document server-side.
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

function bytesToBase64(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

export default async function (req) {
  try {
    const body = await req.json();
    const pngB64 = String(body.png || '').replace(/^data:.*;base64,/, '');
    if (!pngB64) return Response.json({ error: 'png payload required' }, { status: 400 });

    const pngBytes = Uint8Array.from(atob(pngB64), (c) => c.charCodeAt(0));
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4 portrait in points
    const png = await doc.embedPng(pngBytes);
    page.drawImage(png, { x: 0, y: 0, width: 595.28, height: 841.89 });
    const pdfBytes = await doc.save();
    return Response.json({ pdf: bytesToBase64(pdfBytes) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}