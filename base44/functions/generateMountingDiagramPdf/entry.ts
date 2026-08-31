// Mounting diagram PDF.
// Two modes:
//  - { png: "<base64>" }            -> wraps the client-rasterized page PNG into an A4 PDF
//  - { getAssets: true }            -> fetches the two KLK bracket SVGs server-side (no CORS)
//                                     and returns them as base64 text, so the browser can
//                                     rasterize and embed them reliably.
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

const BRACKET_UP_URL = 'https://media.base44.com/images/public/6a5dc0cf6f2847b3a26da201/cbed4d66c_KLK_front_upZB0251_ZB0254.svg';
const BRACKET_DOWN_URL = 'https://media.base44.com/images/public/6a5dc0cf6f2847b3a26da201/33e010e2b_KLK_front_downZB0280.svg';

function bytesToBase64(bytes) {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

async function fetchSvgB64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    return btoa(unescape(encodeURIComponent(text)));
  } catch (_e) {
    return null;
  }
}

export default async function (req) {
  try {
    const body = await req.json();

    if (body && body.getAssets) {
      const [up, down] = await Promise.all([fetchSvgB64(BRACKET_UP_URL), fetchSvgB64(BRACKET_DOWN_URL)]);
      return Response.json({ up, down });
    }

    const pngB64 = String(body?.png || '').replace(/^data:.*;base64,/, '');
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