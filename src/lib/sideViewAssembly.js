// Client-side assembly of the radiator SIDE VIEW for the mounting scheme.
// Draws the depth × height profile (N tubes + top/bottom manifolds + end caps)
// procedurally, recoloured to the selected RAL colour, with connection hardware
// (side/bottom pipes, thermostatic valve, air vent, drain) positioned per connectionCode.
// Geometry mirrors the official Kermi side-view assets and mounting reference.

// ---- colour helpers (mirror renderRadiatorSvg) ----
function hexToRgb(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = 'F4F4F4';
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function lighten(hex, amt) { const { r, g, b } = hexToRgb(hex); return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt); }
function darken(hex, amt) { const { r, g, b } = hexToRgb(hex); return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt)); }

// ---- geometry constants (mm) ----
const TUBE_W = 25;
const TUBE_R = 12.5;
const PITCH = 40;          // centre-to-centre tube spacing (T = 25 + (N-1)*40)
const MANIFOLD_H = 32;     // visible manifold bar height
const MANIFOLD_R = 16;     // manifold corner radius
const TUBE_PROTR = 5;      // tube rounded cap protrusion beyond manifold edge
const STUB_LEN = 20;       // connection pipe stub length
const STUB_W = 14;         // connection pipe stub width
const VENT_H = 16;         // air vent protrusion above manifold
const BLOCK_H = 24;        // bottom connection block height
const BLOCK_W = 34;        // bottom connection block width

// Padding around the core body (0,0)-(T,H) so protrusions are not clipped.
const PAD_L = 36;
const PAD_R = 36;
const PAD_T = 26;
const PAD_B = 44;

// Build a short pipe stub (rounded rect) used for side / bottom connections.
function pipeStub(x, y, w, h, fill, outline, vertical = false) {
  const r = Math.min(w, h) / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${outline}" stroke-width="0.5"/>`;
}

// Thermostatic valve body (compact) attached near a bottom connection block.
function valveBody(cx, cy, fill, outline) {
  return `<g>
    <rect x="${cx - 9}" y="${cy - 14}" width="18" height="28" rx="4" fill="${fill}" stroke="${outline}" stroke-width="0.6"/>
    <rect x="${cx - 6}" y="${cy - 18}" width="12" height="6" rx="2" fill="${darken(fill, 0.15)}" stroke="${outline}" stroke-width="0.4"/>
    <rect x="${cx - 4}" y="${cy + 10}" width="8" height="6" rx="1.5" fill="${darken(fill, 0.25)}" stroke="${outline}" stroke-width="0.4"/>
  </g>`;
}

// Air vent protrusion on top of the top manifold.
function airVent(cx, topY, fill, outline) {
  return `<g>
    <rect x="${cx - 3}" y="${topY - VENT_H}" width="6" height="${VENT_H - 4}" rx="1.5" fill="${lighten(fill, 0.1)}" stroke="${outline}" stroke-width="0.4"/>
    <rect x="${cx - 4}" y="${topY - 6}" width="8" height="4" rx="1" fill="${darken(fill, 0.2)}" stroke="${outline}" stroke-width="0.4"/>
  </g>`;
}

/**
 * Build the side-view radiator SVG.
 * @param {object} opts
 * @param {number} opts.tubes  - number of tubes (2..6)
 * @param {number} opts.height - radiator height H (mm)
 * @param {string} opts.color  - RAL hex colour (#rrggbb)
 * @param {string} opts.connectionCode - e.g. 'N12', 'N69' ...
 * @param {string} opts.valveType  - 'ТВВ' | 'ТВН' | ''
 * @param {string} opts.ventSide   - 'left' | 'right' | 'both' | ''
 * @param {string} opts.ventType   - '1' (built-in vent) | '4' (nipple) | ''
 * @param {boolean} opts.drainValve
 * @returns {{svg: string, viewBox: string, padL: number, padT: number, padR: number, padB: number, T: number, H: number}}
 */
export function buildSideViewSvg({ tubes, height, color, connectionCode, valveType, ventSide, ventType, drainValve }) {
  const N = Math.max(2, Math.min(6, Number(tubes) || 3));
  const H = Math.max(180, Number(height) || 600);
  const T = 25 + (N - 1) * PITCH;
  const cc = String(connectionCode || 'N12').replace(/^N/i, '');
  const base = color || '#F4F4F4';
  const hi = lighten(base, 0.22);
  const sh = darken(base, 0.28);
  const outline = darken(base, 0.40);
  const accent = lighten(base, 0.40);
  const blockFill = darken(base, 0.08);

  const topManY = 0;
  const botManY = H - MANIFOLD_H;
  const topManCy = MANIFOLD_H / 2;
  const botManCy = H - MANIFOLD_H / 2;

  const parts = [];

  // ---- gradients ----
  parts.push(`<defs>
    <linearGradient id="svTube" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${sh}"/><stop offset="22%" stop-color="${base}"/><stop offset="45%" stop-color="${hi}"/><stop offset="55%" stop-color="${hi}"/><stop offset="78%" stop-color="${base}"/><stop offset="100%" stop-color="${sh}"/>
    </linearGradient>
    <linearGradient id="svManTop" x1="0" y1="${topManY}" x2="0" y2="${topManY + MANIFOLD_H}" gradientUnits="userSpaceOnUse">
      <stop offset="20%" stop-color="${accent}"/><stop offset="67%" stop-color="${base}"/>
    </linearGradient>
    <linearGradient id="svManBot" x1="0" y1="${botManY}" x2="0" y2="${botManY + MANIFOLD_H}" gradientUnits="userSpaceOnUse">
      <stop offset="20%" stop-color="${accent}"/><stop offset="67%" stop-color="${base}"/>
    </linearGradient>
    <linearGradient id="svPipe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${sh}"/><stop offset="50%" stop-color="${hi}"/><stop offset="100%" stop-color="${sh}"/>
    </linearGradient>
  </defs>`);

  // ---- bottom connection block (drawn first, behind manifolds) ----
  const isBottom = ['68', '86', '69', '89', '96', '98'].includes(cc);
  let blockX = null;
  if (isBottom) {
    if (['68', '69'].includes(cc)) blockX = 0;                 // left
    else if (['86', '89'].includes(cc)) blockX = T - BLOCK_W; // right
    else blockX = T / 2 - BLOCK_W / 2;                         // centre (96/98)
    const by = H;
    parts.push(`<rect x="${blockX}" y="${by}" width="${BLOCK_W}" height="${BLOCK_H}" rx="6" fill="${blockFill}" stroke="${outline}" stroke-width="0.6"/>`);
    // two nipple pipes under the block
    const n1 = blockX + 9;
    const n2 = blockX + BLOCK_W - 9 - STUB_W;
    parts.push(pipeStub(n1, by + BLOCK_H, STUB_W, STUB_LEN, 'url(#svPipe)', outline, true));
    parts.push(pipeStub(n2, by + BLOCK_H, STUB_W, STUB_LEN, 'url(#svPipe)', outline, true));
    // thermostatic valve (RRV) — ТВВ upper manifold / ТВН lower manifold
    if (['69', '89', '96', '98'].includes(cc) && (valveType === 'ТВВ' || valveType === 'ТВН')) {
      const vy = valveType === 'ТВВ' ? topManCy : botManCy;
      const vx = blockX + BLOCK_W / 2;
      parts.push(valveBody(vx, vy, accent, outline));
    }
  }

  // ---- side connection stubs (protrude outward from the manifold ends) ----
  const sideMap = {
    '12': { top: 'L', bot: 'L' },
    '34': { top: 'R', bot: 'R' },
    '14': { top: 'L', bot: 'R' },
    '32': { top: 'R', bot: 'L' },
  };
  // Side connections live on the radiator end-face (along the length axis), so in the
  // depth×height side profile they protrude toward the viewer. Represent them as short
  // stubs off the front face (x = T) at the top (supply) and bottom (return) manifolds.
  if (sideMap[cc]) {
    parts.push(pipeStub(T, topManCy - STUB_W / 2, STUB_LEN, STUB_W, 'url(#svPipe)', outline));
    parts.push(pipeStub(T, botManCy - STUB_W / 2, STUB_LEN, STUB_W, 'url(#svPipe)', outline));
  }

  // ---- manifolds ----
  parts.push(`<rect x="0" y="${topManY}" width="${T}" height="${MANIFOLD_H}" rx="${MANIFOLD_R}" fill="url(#svManTop)" stroke="${outline}" stroke-width="0.5"/>`);
  parts.push(`<rect x="0" y="${botManY}" width="${T}" height="${MANIFOLD_H}" rx="${MANIFOLD_R}" fill="url(#svManBot)" stroke="${outline}" stroke-width="0.5"/>`);

  // ---- tubes (in front of manifolds, protruding beyond their edges) ----
  for (let i = 0; i < N; i++) {
    const x = i * PITCH;
    parts.push(`<rect x="${x}" y="${-TUBE_PROTR}" width="${TUBE_W}" height="${H + 2 * TUBE_PROTR}" rx="${TUBE_R}" fill="url(#svTube)" stroke="${outline}" stroke-width="0.5"/>`);
  }

  // ---- air vent (on top manifold) ----
  if (ventType === '1' && (ventSide === 'left' || ventSide === 'right' || ventSide === 'both')) {
    if (ventSide === 'left' || ventSide === 'both') parts.push(airVent(TUBE_W / 2, topManY, base, outline));
    if (ventSide === 'right' || ventSide === 'both') parts.push(airVent(T - TUBE_W / 2, topManY, base, outline));
  }

  // ---- drain valve (below bottom manifold, same side as vent) ----
  if (drainValve) {
    const drainRight = ['12', '14', '68', '69', '98'].includes(cc);
    const dx = drainRight ? T - TUBE_W / 2 : TUBE_W / 2;
    parts.push(pipeStub(dx - STUB_W / 2, H, STUB_W, STUB_LEN, 'url(#svPipe)', outline, true));
  }

  const inner = parts.join('');
  const viewBox = `${-PAD_L} ${-PAD_T} ${T + PAD_L + PAD_R} ${H + PAD_T + PAD_B}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

  return { svg, inner, viewBox, padL: PAD_L, padT: PAD_T, padR: PAD_R, padB: PAD_B, T, H };
}