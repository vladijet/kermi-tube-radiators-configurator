// Builds the A4 mounting diagram as an SVG, rasterizes it to a PNG in the browser,
// and returns the PNG blob. The PNG is sent to the server function which wraps it into a PDF.
import { getRalColor } from './ralColors';
import { getInteraxisN, getFloorOffsetA, getDepthT, getBracketPositions, getKlkBracketCount, getBracketK } from './mountingGeometry';
import { base44 } from '@/api/base44Client';

// User-supplied KLK bracket assets (front view)
const BRACKET_UP_URL = 'https://media.base44.com/images/public/6a5dc0cf6f2847b3a26da201/cbed4d66c_KLK_front_upZB0251_ZB0254.svg';
const BRACKET_DOWN_URL = 'https://media.base44.com/images/public/6a5dc0cf6f2847b3a26da201/33e010e2b_KLK_front_downZB0280.svg';

const PAGE_W = 210; // A4 mm
const PAGE_H = 297;
const DPI = 150;
const PX_PER_MM = DPI / 25.4;

function escapeXml(s) {
  return String(s ?? '').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
}

async function fetchSvgText(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch (_e) {
    return null;
  }
}

function b64ToUtf8(b64) {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch (_e) {
    return null;
  }
}

// Fetch both bracket SVGs, falling back to the server function if a direct browser
// fetch is blocked by CORS (the server fetches the media URLs with no restrictions).
async function resolveBracketSvgs() {
  const [upText, downText] = await Promise.all([fetchSvgText(BRACKET_UP_URL), fetchSvgText(BRACKET_DOWN_URL)]);
  if (upText && downText) return { upText, downText };
  let assets = null;
  try {
    const res = await base44.functions.invoke('generateMountingDiagramPdf', { getAssets: true });
    assets = res?.data;
  } catch (_e) {
    assets = null;
  }
  return {
    upText: upText || (assets?.up ? b64ToUtf8(assets.up) : null),
    downText: downText || (assets?.down ? b64ToUtf8(assets.down) : null),
  };
}

function parseViewBox(text) {
  const m = text.match(/viewBox=["']([^"']+)["']/i);
  if (m) {
    const parts = m[1].split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) return { w: parts[2], h: parts[3] };
  }
  const wM = text.match(/<svg[^>]*\swidth=["']([\d.]+)["']/i);
  const hM = text.match(/<svg[^>]*\sheight=["']([\d.]+)["']/i);
  const w = wM ? parseFloat(wM[1]) : 100;
  const h = hM ? parseFloat(hM[1]) : 100;
  return { w, h };
}

// Render an SVG string to a PNG data URI via a canvas (browser). Keeps bracket rendering
// reliable (PNG images always render inside an SVG used as an image source).
async function svgToPngDataUri(svgText) {
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    const vb = parseViewBox(svgText);
    const aspect = vb.w / vb.h;
    const targetH = 600;
    const targetW = Math.round(targetH * aspect);
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, targetW, targetH);
    return { dataUri: canvas.toDataURL('image/png'), aspect };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function lighten(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round((255 - ((n >> 16) & 255)) * amt));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round((255 - ((n >> 8) & 255)) * amt));
  const b = Math.min(255, (n & 255) + Math.round((255 - (n & 255)) * amt));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}
function darken(hex, amt) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * (1 - amt)));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * (1 - amt)));
  const b = Math.max(0, Math.round((n & 255) * (1 - amt)));
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Dimension line primitives in page-mm coordinates
function dimV(x, y1, y2, label, color = '#111', fontSize = 3) {
  const top = Math.min(y1, y2);
  const bot = Math.max(y1, y2);
  const ext = 2.5;
  const arr = 1.4;
  const midY = (top + bot) / 2;
  return `
    <g stroke="${color}" stroke-width="0.25" fill="none">
      <line x1="${x - ext}" y1="${top}" x2="${x + ext}" y2="${top}"/>
      <line x1="${x - ext}" y1="${bot}" x2="${x + ext}" y2="${bot}"/>
      <line x1="${x}" y1="${top}" x2="${x}" y2="${midY - arr}"/>
      <line x1="${x}" y1="${midY + arr}" x2="${x}" y2="${bot}"/>
    </g>
    <polygon points="${x},${top} ${x - arr},${top + arr} ${x + arr},${top + arr}" fill="${color}"/>
    <polygon points="${x},${bot} ${x - arr},${bot - arr} ${x + arr},${bot - arr}" fill="${color}"/>
    <text x="${x - 1.5}" y="${midY}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${color}" text-anchor="end" dominant-baseline="central" transform="rotate(-90 ${x - 1.5} ${midY})">${escapeXml(label)}</text>`;
}
function dimH(y, x1, x2, label, color = '#111', fontSize = 3) {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const ext = 2.5;
  const arr = 1.4;
  const midX = (left + right) / 2;
  return `
    <g stroke="${color}" stroke-width="0.25" fill="none">
      <line x1="${left}" y1="${y - ext}" x2="${left}" y2="${y + ext}"/>
      <line x1="${right}" y1="${y - ext}" x2="${right}" y2="${y + ext}"/>
      <line x1="${left}" y1="${y}" x2="${midX - arr}" y2="${y}"/>
      <line x1="${midX + arr}" y1="${y}" x2="${right}" y2="${y}"/>
    </g>
    <polygon points="${left},${y} ${left + arr},${y - arr} ${left + arr},${y + arr}" fill="${color}"/>
    <polygon points="${right},${y} ${right - arr},${y - arr} ${right - arr},${y + arr}" fill="${color}"/>
    <text x="${midX}" y="${y - 1.6}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${color}" text-anchor="middle">${escapeXml(label)}</text>`;
}

function buildHeaderSvg(article) {
  return `
    <text x="15" y="10" font-family="Arial, sans-serif" font-size="2.6" fill="#9a9a9a">PDF Монтажная схема</text>
    <g transform="translate(15 14)">
      <rect x="0" y="0" width="9" height="9" rx="1.6" fill="#BFCE00"/>
      <text x="4.5" y="7.4" font-family="Arial, sans-serif" font-weight="bold" font-size="6.5" fill="#ffffff" text-anchor="middle">K</text>
      <text x="12" y="5" font-family="Arial, sans-serif" font-weight="bold" font-size="6" fill="#333333">Kermi</text>
      <text x="12" y="8.4" font-family="Arial, sans-serif" font-size="2.6" fill="#9a9a9a" letter-spacing="0.4">ТРУБЧАТЫЕ РАДИАТОРЫ</text>
    </g>
    <text x="105" y="22" font-family="Arial, sans-serif" font-weight="bold" font-size="4.5" fill="#222222" text-anchor="middle">Премиальные трубчатые радиаторы</text>
    <text x="105" y="28" font-family="Arial, sans-serif" font-size="3.5" fill="#555555" text-anchor="middle">KERMI из Германии</text>
    <text x="195" y="25" font-family="Arial, sans-serif" font-size="3" fill="#555555" text-anchor="end">https://rr.kermi-configurator.com</text>
    <line x1="15" y1="34" x2="195" y2="34" stroke="#222222" stroke-width="0.3"/>
    <text x="105" y="45" font-family="Arial, sans-serif" font-weight="bold" font-size="7" fill="#111111" text-anchor="middle" letter-spacing="1">МОНТАЖНАЯ СХЕМА</text>
    <text x="15" y="54" font-family="Arial, sans-serif" font-size="3" fill="#9a9a9a">Артикул</text>
    <rect x="50" y="49.5" width="145" height="6" fill="#dfff00"/>
    <text x="52" y="53.8" font-family="Arial, sans-serif" font-weight="bold" font-size="3.6" fill="#111111">${escapeXml(article || '')}</text>`;
}

function buildTableSvg(cfg) {
  const isRRV = cfg.series === 'RRV';
  const rows = [
    ['СЕРИЯ', cfg.series, 'МОДЕЛЬ', cfg.model],
    ['СЕКЦИИ', String(cfg.sections), 'РЯДНОСТЬ', `${cfg.tubes} труб.`],
    ['ПОДКЛЮЧЕНИЕ', `${isRRV ? '31' : '2'} / ${cfg.connDisplay} / ${cfg.connSize}`, 'МЕЖОСЕВОЕ', cfg.interaxisN ? `${cfg.interaxisN} мм` : '—'],
    ['ГЛУБИНА', `${cfg.depth} мм`, 'ДЛИНА', `${cfg.length} мм`],
    ['ВЫСОТА', `${cfg.height} мм`, 'ВЕС', `${cfg.weight} кг`],
    ['РЕЗЬБОВОЕ ПОД ВОЗДУШНИК (L)', cfg.ventSpec, 'ДАВЛЕНИЕ', cfg.pressure],
    ['КРЕПЛЕНИЯ', cfg.bracketCount ? `KLK - ${cfg.bracketCount} шт` : '—', 'ЦВЕТ', cfg.colorLabel],
    [`Q НОМ ΔT60`, `${cfg.qNom} Вт`, `Q РАСЧ ΔT${cfg.deltaT}`, `${cfg.qReal} Вт`],
  ];
  const xL1 = 15, xV1 = 42, xL2 = 105, xV2 = 132;
  const colW = [27, 63, 27, 63];
  const y0 = 62;
  const rowH = 8;
  let svg = `<rect x="15" y="${y0 - 1}" width="180" height="${rows.length * rowH + 2}" fill="#ffffff" stroke="#dcdcdc" stroke-width="0.3"/>`;
  rows.forEach((r, i) => {
    const y = y0 + i * rowH;
    const isLast = i === rows.length - 1;
    const green = (i === rows.length - 1);
    svg += `<line x1="15" y1="${y}" x2="195" y2="${y}" stroke="#dcdcdc" stroke-width="0.2"/>`;
    svg += `<text x="${xL1}" y="${y + 5}" font-family="Arial, sans-serif" font-size="2.8" fill="#9a9a9a" letter-spacing="0.3">${escapeXml(r[0])}</text>`;
    svg += `<text x="${xV1}" y="${y + 5}" font-family="Arial, sans-serif" font-weight="bold" font-size="3.3" fill="#222222">${escapeXml(r[1])}</text>`;
    svg += `<line x1="${xL2 - 3}" y1="${y}" x2="${xL2 - 3}" y2="${y + rowH}" stroke="#dcdcdc" stroke-width="0.2"/>`;
    svg += `<text x="${xL2}" y="${y + 5}" font-family="Arial, sans-serif" font-size="2.8" fill="#9a9a9a" letter-spacing="0.3">${escapeXml(r[2])}</text>`;
    if (green) {
      svg += `<rect x="${xV2 - 1}" y="${y + 1}" width="${63}" height="${rowH - 2}" fill="#dfff00"/>`;
    }
    svg += `<text x="${xV2}" y="${y + 5}" font-family="Arial, sans-serif" font-weight="bold" font-size="3.3" fill="${green ? '#111111' : '#222222'}">${escapeXml(r[3])}</text>`;
  });
  svg += `<line x1="15" y1="${y0 + rows.length * rowH}" x2="195" y2="${y0 + rows.length * rowH}" stroke="#dcdcdc" stroke-width="0.2"/>`;
  return svg;
}

function buildVisualSvg(cfg, brackets) {
  // Radiator schematic in its own mm coordinates (origin top-left of radiator).
  const H = cfg.height;
  const B = cfg.length;
  const manifoldH = 60;
  const tubeR = 12.5;
  const tubeW = 25;
  const sections = cfg.sections;
  const base = cfg.ralHex;
  const hi = lighten(base, 0.22);
  const sh = darken(base, 0.28);
  const outline = darken(base, 0.4);
  const A = cfg.floorA;
  const positions = cfg.bracketPositions || [];

  // Visual area on the page
  const visX = 15;
  const visY = 132;
  const visW = 180;
  const visH = 158;
  const leftPad = 22;  // for vertical dims
  const botPad = 20;   // for horizontal dims
  const floorDrop = A;
  const drawW = B;
  const drawH = H + floorDrop;
  const s = Math.min((visW - leftPad) / drawW, (visH - botPad) / drawH);
  const tx = visX + leftPad + (visW - leftPad - drawW * s) / 2;
  const ty = visY + 4;

  // Page-coordinate projections of radiator key points
  const px = (rx) => tx + rx * s;
  const py = (ry) => ty + ry * s;
  const radLeftPx = px(0);
  const radRightPx = px(B);
  const radTopPx = py(0);
  const radBotPx = py(H);
  const floorPx = py(H + A);
  const topHubPx = py(35);
  const botHubPx = py(H - 35);

  let svg = `<rect x="${visX}" y="${visY}" width="${visW}" height="${visH}" fill="#ffffff" stroke="none"/>`;

  // Radiator schematic (scaled group, radiator-mm units)
  svg += `<g transform="translate(${tx} ${ty}) scale(${s})">`;
  // top manifold
  svg += `<rect x="0" y="0" width="${B}" height="${manifoldH}" fill="${base}" stroke="${outline}" stroke-width="1" rx="3"/>`;
  svg += `<rect x="0" y="0" width="${B}" height="${manifoldH * 0.4}" fill="${hi}" opacity="0.6"/>`;
  // bottom manifold
  svg += `<rect x="0" y="${H - manifoldH}" width="${B}" height="${manifoldH}" fill="${base}" stroke="${outline}" stroke-width="1" rx="3"/>`;
  svg += `<rect x="0" y="${H - manifoldH}" width="${B}" height="${manifoldH * 0.4}" fill="${hi}" opacity="0.6"/>`;
  // tubes
  for (let i = 0; i < sections; i++) {
    const cx = i * 45 + 23;
    const tx2 = cx - tubeR;
    const ty2 = manifoldH;
    const th = H - 2 * manifoldH;
    svg += `<rect x="${tx2}" y="${ty2}" width="${tubeW}" height="${th}" fill="${base}" stroke="${outline}" stroke-width="0.6" rx="${tubeR}"/>`;
    svg += `<rect x="${cx - 4}" y="${ty2}" width="3" height="${th}" fill="${hi}" opacity="0.5"/>`;
  }
  svg += `</g>`;

  // Brackets (PNG images placed at hub centers, page-mm coords)
  if (brackets.up && brackets.down && cfg.includeBracketKLK && H >= 300 && sections >= 6 && positions.length) {
    const upH = 22; // mm tall on page
    const upW = upH * brackets.up.aspect;
    const dnH = 16;
    const dnW = dnH * brackets.down.aspect;
    positions.forEach((secIdx) => {
      const cxPx = px((secIdx - 1) * 45 + 23);
      // upper bracket centered on top hub
      svg += `<image href="${brackets.up.dataUri}" x="${cxPx - upW / 2}" y="${topHubPx - upH / 2}" width="${upW}" height="${upH}"/>`;
      // lower bracket centered on bottom hub
      svg += `<image href="${brackets.down.dataUri}" x="${cxPx - dnW / 2}" y="${botHubPx - dnH / 2}" width="${dnW}" height="${dnH}"/>`;
    });
  }

  // Floor line + hatching
  svg += `<line x1="${px(-8)}" y1="${floorPx}" x2="${px(B + 8)}" y2="${floorPx}" stroke="#444" stroke-width="0.4"/>`;
  const hatchN = Math.max(6, Math.round((B + 16) / 18));
  for (let i = 0; i <= hatchN; i++) {
    const xh = px(-8) + (i / hatchN) * (px(B + 8) - px(-8));
    svg += `<line x1="${xh}" y1="${floorPx}" x2="${xh - 3}" y2="${floorPx + 4}" stroke="#888" stroke-width="0.2"/>`;
  }

  // Dimension lines (page-mm coords, unscaled so text stays readable)
  const N = cfg.interaxisN;
  // left side: H (full), N (between hubs)
  svg += dimV(radLeftPx - 6, radTopPx, radBotPx, `H = ${H} мм`, '#111', 3);
  svg += dimV(radLeftPx - 14, topHubPx, botHubPx, `N = ${N} мм`, '#111', 3);
  // right side: 35 (top), A (bottom->floor)
  svg += dimV(radRightPx + 6, radTopPx, topHubPx, `35`, '#111', 2.6);
  svg += dimV(radRightPx + 6, radBotPx, floorPx, `A = ${A} мм`, '#111', 3);
  // below floor: 45 (one pitch), B (total), K (bracket span)
  const dimY1 = floorPx + 7;
  const dimY2 = floorPx + 14;
  const firstCxPx = px(23);
  const secondCxPx = px(45 + 23);
  svg += dimH(dimY1, firstCxPx, secondCxPx, `45 мм`, '#111', 2.6);
  svg += dimH(dimY2, radLeftPx, radRightPx, `B = ${B} мм`, '#111', 3);
  if (positions.length >= 2) {
    const K = getBracketK(positions);
    const kx1 = px((positions[0] - 1) * 45 + 23);
    const kx2 = px((positions[positions.length - 1] - 1) * 45 + 23);
    svg += dimH(dimY2 + 7, kx1, kx2, `K = ${K} мм`, '#111', 2.6);
  }
  // ZB0257 note for long radiators
  if (cfg.sections >= 22) {
    svg += `<text x="${visX + visW}" y="${visY + visH - 2}" font-family="Arial, sans-serif" font-size="2.8" fill="#555" text-anchor="end">Длина ≥ 22 звеньев: доп. держатель ZB0257</text>`;
  }
  return svg;
}

async function buildPageSvg(cfg) {
  const { upText, downText } = await resolveBracketSvgs();
  const brackets = {
    up: upText ? await svgToPngDataUri(upText) : null,
    down: downText ? await svgToPngDataUri(downText) : null,
  };
  const inner = buildHeaderSvg(cfg.article) + buildTableSvg(cfg) + buildVisualSvg(cfg, brackets);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(PAGE_W * PX_PER_MM)}" height="${Math.round(PAGE_H * PX_PER_MM)}" viewBox="0 0 ${PAGE_W} ${PAGE_H}">${inner}</svg>`;
}

async function rasterize(svgString) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(PAGE_W * PX_PER_MM);
    canvas.height = Math.round(PAGE_H * PX_PER_MM);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png', 0.92));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function buildMountingDiagram(cfg) {
  const svg = await buildPageSvg(cfg);
  const pngBlob = await rasterize(svg);
  return pngBlob;
}

export function buildDiagramConfig({
  series, article, selected, connDisplay, connSize, ventSpec, pressure,
  colorCode, ralCode, colorLabel, deltaT, includeBracketKLK, connGroup,
}) {
  const ral = getRalColor(ralCode);
  const tubes = selected.tubes;
  const height = selected.height;
  const sections = selected.sections;
  const bracketCount = getKlkBracketCount(tubes, height, sections);
  const bracketPositions = getBracketPositions(sections, bracketCount);
  return {
    series,
    article,
    model: selected.model,
    sections,
    tubes,
    height,
    depth: selected.depth,
    length: selected.length,
    connDisplay,
    connSize,
    interaxisN: getInteraxisN(height),
    ventSpec,
    pressure,
    bracketCount,
    bracketPositions,
    colorCode,
    ralCode,
    ralHex: ral.hex,
    colorLabel,
    qNom: selected.qNomTotal,
    qReal: selected.qRealTotal,
    deltaT: Number(deltaT).toFixed(0),
    weight: selected.totalWeight,
    floorA: getFloorOffsetA(tubes),
    depthT: getDepthT(tubes),
    includeBracketKLK,
  };
}