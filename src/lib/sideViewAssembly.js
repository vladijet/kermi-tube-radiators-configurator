// Client-side assembly of the radiator SIDE VIEW for the mounting scheme.
// Layers (per the official Kermi assembly rule):
//   1. Manifold caps with cutouts (solid)
//   2. Vertical tubes (left / centre / right) with a cylindrical gradient
//   3. Manifold gradient overlay (softens the bar)
//   4. Hex bolt caps (official assets) centred on the collectors
// All geometry is generated for the model's tube count (2..6); the official hex
// caps are embedded as nested SVGs and recoloured to the selected RAL.

import { ralShades, recolorAsset, darken, lighten, CAP_UP_INNER, CAP_DOWN_INNER } from './sideViewAssets';

// ---- geometry constants (mm) ----
const TUBE_W = 25;
const PITCH = 40;          // T = 25 + (N-1)*40
const MANIFOLD_H = 87;     // manifold bar height
const MANIFOLD_R = 20;     // manifold corner radius
const NOTCH_TOP = 68.95;     // notch depth from the bar's inner edge (official Kermi cap)
const NOTCH_CR = 5;         // notch corner radius (official Kermi cap — soft, no "ears")

// Padding around the (0,0)-(T,H) body so caps / hardware are not clipped.
const PAD_L = 50;
const PAD_R = 50;
const PAD_T = 30;
const PAD_B = 50;

// Connection hardware
const STUB_LEN = 20;
const STUB_W = 14;
const VENT_H = 16;
const BLOCK_H = 24;
const BLOCK_W = 34;

// ---- Layer 1 / 3: manifold cap path (top, rounded top edge + notches) ----
function manifoldCapPath(T, N) {
  const sideY = MANIFOLD_H - 13.05; // 73.95 — notch side wall top
  let d = `M0 ${MANIFOLD_R}C0 ${(MANIFOLD_R - 11.05).toFixed(2)} 8.95 0 ${MANIFOLD_R} 0H${(T - MANIFOLD_R).toFixed(2)}C${(T - 8.95).toFixed(2)} 0 ${T} 8.95 ${T} ${MANIFOLD_R}V${MANIFOLD_H}`;
  for (let i = N - 2; i >= 0; i--) {
    const nl = TUBE_W + PITCH * i;       // notch left (tube i right edge)
    const nr = PITCH + PITCH * i;        // notch right (tube i+1 left edge)
    d += `H${nr}V${sideY.toFixed(2)}` +
      `C${nr} ${(NOTCH_TOP + NOTCH_CR).toFixed(2)} ${(nr - NOTCH_CR).toFixed(2)} ${NOTCH_TOP} ${(nr - NOTCH_CR).toFixed(2)} ${NOTCH_TOP}` +
      `H${(nl + NOTCH_CR).toFixed(2)}` +
      `C${(nl + NOTCH_CR).toFixed(2)} ${NOTCH_TOP} ${nl} ${(NOTCH_TOP + NOTCH_CR).toFixed(2)} ${nl} ${sideY.toFixed(2)}` +
      `V${MANIFOLD_H}`;
  }
  d += `H0V${MANIFOLD_R}Z`;
  return d;
}

// ---- Layer 2: tube paths (full height H) ----
function leftTubePath(H) {
  const r = MANIFOLD_R;
  return `M${TUBE_W} ${(H - r).toFixed(2)}C${TUBE_W} ${(H - 8.95).toFixed(2)} 16.05 ${H} 5 ${H}H0V0H5C16.05 0 ${TUBE_W} 8.95 ${TUBE_W} ${r}V${(H - r).toFixed(2)}Z`;
}
function centerTubePath(x, H) {
  return `M${x} ${H}H${(x + TUBE_W / 2).toFixed(2)}H${x + TUBE_W}V0H${x}V${H}Z`;
}
function rightTubePath(x, H) {
  const r = MANIFOLD_R;
  return `M${x} ${(H - r).toFixed(2)}C${x} ${(H - 8.95).toFixed(2)} ${(x + 8.95).toFixed(2)} ${H} ${x + 20} ${H}H${x + TUBE_W}V0H${x + 20}C${(x + 8.95).toFixed(2)} 0 ${x} 8.95 ${x} ${r}V${(H - r).toFixed(2)}Z`;
}

// ---- connection hardware helpers ----
function pipeStub(x, y, w, h, fill, outline) {
  const r = Math.min(w, h) / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${outline}" stroke-width="0.5"/>`;
}
function valveBody(cx, cy, fill, outline) {
  return `<g><rect x="${cx - 9}" y="${cy - 14}" width="18" height="28" rx="4" fill="${fill}" stroke="${outline}" stroke-width="0.6"/>` +
    `<rect x="${cx - 6}" y="${cy - 18}" width="12" height="6" rx="2" fill="${darken(fill, 0.15)}" stroke="${outline}" stroke-width="0.4"/>` +
    `<rect x="${cx - 4}" y="${cy + 10}" width="8" height="6" rx="1.5" fill="${darken(fill, 0.25)}" stroke="${outline}" stroke-width="0.4"/></g>`;
}
function airVent(cx, topY, fill, outline) {
  return `<g><rect x="${cx - 3}" y="${topY - VENT_H}" width="6" height="${VENT_H - 4}" rx="1.5" fill="${lighten(fill, 0.1)}" stroke="${outline}" stroke-width="0.4"/>` +
    `<rect x="${cx - 4}" y="${topY - 6}" width="8" height="4" rx="1" fill="${darken(fill, 0.2)}" stroke="${outline}" stroke-width="0.4"/></g>`;
}

/**
 * Build the side-view radiator SVG (layered, official assets, recoloured to RAL).
 * @returns {{svg,inner,viewBox,padL,padT,padR,padB,T,H}}
 */
export function buildSideViewSvg({ tubes, height, color, connectionCode, valveType, ventSide, ventType, drainValve, series }) {
  const N = Math.max(2, Math.min(6, Number(tubes) || 3));
  const H = Math.max(180, Number(height) || 600);
  const T = TUBE_W + (N - 1) * PITCH;
  const cc = String(connectionCode || 'N12').replace(/^N/i, '');
  const base = color || '#F4F4F4';
  const s = ralShades(base); // s[0] darkest ... s[10] lightest
  const outline = s[3];     // darken 0.28
  const tubeEdge = s[7];     // base
  const tubeLight = s[10];   // lightest
  const manifoldSolid = s[7];
  const manifoldGrad = s[8];
  const blockFill = s[6];
  const pipeFill = `url(#svPipe)`;

  const capPath = manifoldCapPath(T, N);
  const parts = [];

  // ---- defs ----
  parts.push(`<defs>
<linearGradient id="svTube" x1="0" y1="0" x2="${TUBE_W}" y2="0">
<stop offset="0.077" stop-color="${tubeEdge}"/><stop offset="0.418" stop-color="${tubeLight}"/><stop offset="0.659" stop-color="${tubeLight}"/><stop offset="1" stop-color="${tubeEdge}"/>
</linearGradient>
<linearGradient id="svManTop" x1="0" y1="0" x2="0" y2="${MANIFOLD_H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="${manifoldGrad}"/><stop offset="0.79" stop-color="${manifoldGrad}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="svManBot" x1="0" y1="${H}" x2="0" y2="${H - MANIFOLD_H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="${manifoldGrad}"/><stop offset="0.79" stop-color="${manifoldGrad}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="svPipe" x1="0" y1="0" x2="${STUB_W}" y2="0">
<stop offset="0" stop-color="${s[4]}"/><stop offset="0.5" stop-color="${s[9]}"/><stop offset="1" stop-color="${s[4]}"/>
</linearGradient>
</defs>`);

  // ---- Layer 1: manifold caps (solid, with tube cutouts) ----
  parts.push(`<path d="${capPath}" fill="${manifoldSolid}"/>`);
  parts.push(`<path d="${capPath}" fill="${manifoldSolid}" transform="matrix(1 0 0 -1 0 ${H})"/>`);

  // ---- Layer 2: tubes ----
  parts.push(`<path d="${leftTubePath(H)}" fill="url(#svTube)"/>`);
  for (let i = 1; i < N - 1; i++) parts.push(`<path d="${centerTubePath(PITCH * i, H)}" fill="url(#svTube)"/>`);
  parts.push(`<path d="${rightTubePath(PITCH * (N - 1), H)}" fill="url(#svTube)"/>`);

  // ---- Layer 3: manifold gradient overlay ----
  parts.push(`<path d="${capPath}" fill="url(#svManTop)"/>`);
  parts.push(`<path d="${capPath}" fill="url(#svManBot)" transform="matrix(1 0 0 -1 0 ${H})"/>`);

  // ---- Layer 4: hex bolt caps (official assets, recoloured) ----
  parts.push(`<svg x="${(T / 2 - 43.8).toFixed(2)}" y="${(34 - 31.7).toFixed(2)}" width="73" height="77" viewBox="0 0 73 77">${recolorAsset(CAP_UP_INNER, base)}</svg>`);
  parts.push(`<svg x="${(T / 2 - 36).toFixed(2)}" y="${(H - 35 - 31.7).toFixed(2)}" width="93" height="85" viewBox="0 0 93 85">${recolorAsset(CAP_DOWN_INNER, base)}</svg>`);

  // ---- connection hardware ----
  const topManCy = MANIFOLD_H / 2;
  const botManCy = H - MANIFOLD_H / 2;

  // bottom connection block (codes 68/86/69/89/96/98)
  const isBottom = ['68', '86', '69', '89', '96', '98'].includes(cc);
  if (isBottom) {
    let blockX;
    if (['68', '69'].includes(cc)) blockX = 0;
    else if (['86', '89'].includes(cc)) blockX = T - BLOCK_W;
    else blockX = T / 2 - BLOCK_W / 2;
    parts.push(`<rect x="${blockX}" y="${H}" width="${BLOCK_W}" height="${BLOCK_H}" rx="6" fill="${blockFill}" stroke="${outline}" stroke-width="0.6"/>`);
    const n1 = blockX + 9;
    const n2 = blockX + BLOCK_W - 9 - STUB_W;
    parts.push(pipeStub(n1, H + BLOCK_H, STUB_W, STUB_LEN, pipeFill, outline));
    parts.push(pipeStub(n2, H + BLOCK_H, STUB_W, STUB_LEN, pipeFill, outline));
    const isRRV = String(series || '').toUpperCase() === 'RRV';
    if (['69', '89', '96', '98'].includes(cc) && (valveType === 'ТВВ' || (valveType === 'ТВН' && !isRRV))) {
      const vy = valveType === 'ТВВ' ? topManCy : botManCy;
      parts.push(valveBody(blockX + BLOCK_W / 2, vy, s[9], outline));
    }
  }

  // side connection stubs (codes 12/34/14/32) — protrude from the front face
  const sideMap = { '12': 1, '34': 1, '14': 1, '32': 1 };
  if (sideMap[cc]) {
    parts.push(pipeStub(T, topManCy - STUB_W / 2, STUB_LEN, STUB_W, pipeFill, outline));
    parts.push(pipeStub(T, botManCy - STUB_W / 2, STUB_LEN, STUB_W, pipeFill, outline));
  }

  // air vent (built-in, on top manifold)
  if (ventType === '1' && (ventSide === 'left' || ventSide === 'right' || ventSide === 'both')) {
    if (ventSide === 'left' || ventSide === 'both') parts.push(airVent(TUBE_W / 2, 0, base, outline));
    if (ventSide === 'right' || ventSide === 'both') parts.push(airVent(T - TUBE_W / 2, 0, base, outline));
  }

  // drain valve (below bottom manifold)
  if (drainValve) {
    const drainRight = ['12', '14', '68', '69', '98'].includes(cc);
    const dx = drainRight ? T - TUBE_W / 2 : TUBE_W / 2;
    parts.push(pipeStub(dx - STUB_W / 2, H, STUB_W, STUB_LEN, pipeFill, outline));
  }

  const inner = parts.join('');
  const viewBox = `${-PAD_L} ${-PAD_T} ${T + PAD_L + PAD_R} ${H + PAD_T + PAD_B}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  return { svg, inner, viewBox, padL: PAD_L, padT: PAD_T, padR: PAD_R, padB: PAD_B, T, H };
}