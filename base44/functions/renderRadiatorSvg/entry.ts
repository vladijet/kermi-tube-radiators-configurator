// Server-side SVG generator for Kermi tubular radiators.
// Additive assembly: manifold elements (section hubs) + vertical tubes + 4 end-cap plugs.

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

const PITCH = 45;
const TUBE_W = 25;
const TUBE_R = 12.5;
const ELEM_W = 46;
const ELEM_H = 60;

// Manifold element path (from radiatorsectionmanifoldelement.svg, 46×60 viewport)
const MANIFOLD_PATH = 'M13.0443 0.199219H32.9524C33.2164 0.199219 33.4766 0.251084 33.7211 0.350668C34.5913 0.705135 36.8192 1.59511 38.4093 2.07742C39.6743 2.46111 42.0622 2.95409 43.6657 3.26814C44.609 3.45288 45.2975 4.27383 45.3036 5.23501L45.5976 51.6932C45.6034 52.5991 45.0002 53.3955 44.1405 53.6808C42.9793 54.0661 41.3562 54.6688 40.1401 55.3738C38.5688 56.2847 36.3692 58.1244 35.3397 59.0123C34.9672 59.3336 34.4938 59.5142 34.0019 59.5142H11.9695C11.4725 59.5142 10.9948 59.33 10.6202 59.0032C9.59854 58.1119 7.42913 56.2816 5.8406 55.3738C4.59091 54.6596 2.88526 54.0504 1.67753 53.6658C0.811424 53.39 0.199219 52.5955 0.199219 51.6866V5.26271C0.199219 4.28921 0.899797 3.45692 1.85701 3.27961C3.49906 2.97546 5.98201 2.49089 7.50102 2.07742C9.36454 1.57018 11.3839 0.732653 12.2178 0.372572C12.4793 0.25965 12.7595 0.199219 13.0443 0.199219Z';

// Hub geometry (derived from the manifold path)
const HUB_TOP = 5.26;
const HUB_BOT = 51.69;
const HUB_R = (HUB_BOT - HUB_TOP) / 2;
const HUB_CY = (HUB_TOP + HUB_BOT) / 2;

// End-cap element paths (from el1–el4.svg)
const EL1_PATH = 'M4.37891 47.2412L0.94043 46.9678C0.550668 46.9367 0.250143 46.6117 0.25 46.2207V1.38281L0.263672 1.24219C0.324411 0.922554 0.588438 0.671487 0.922852 0.636719L4.37891 0.277344V47.2412Z';
const EL2_PATH = 'M8.66895 0.25V20.7305H0.672852C0.671778 20.714 0.671095 20.6968 0.669922 20.6787C0.657937 20.4943 0.640673 20.2261 0.620117 19.8916C0.579006 19.2226 0.523561 18.288 0.46875 17.2256C0.359056 15.0993 0.25 12.4654 0.25 10.4238C0.250007 8.38236 0.359064 5.78148 0.46875 3.68848C0.523555 2.64272 0.579012 1.72484 0.620117 1.06836C0.640655 0.740353 0.657939 0.477601 0.669922 0.296875C0.670992 0.280738 0.671865 0.264816 0.672852 0.25H8.66895Z';
const EL3_PATH = 'M5.58008 10.1309H8.23047V0.25H0.277344L0.854492 5.86719C1.10379 8.28943 3.145 10.1309 5.58008 10.1309Z';
const EL4_PATH = 'M5.58008 0.25H8.23047V10.1309H0.277344L0.854492 4.51367C1.10379 2.09143 3.145 0.25 5.58008 0.25Z';

// Valve connection pipe (el5) — RRV bottom connection, 25×30 viewport
const EL5_PATH = 'M1 29.75H24C24.4142 29.75 24.75 29.4142 24.75 29V0.25H0.25V29C0.25 29.4142 0.585787 29.75 1 29.75Z';
const EL5_W = 25;
const EL5_H = 30;
const EL5_PROTR = 20; // protrusion below the manifold bottom edge

// Thermostatic valve (el6) paths — 19×24 viewport; attached flush to the right end cap on RRV N89
const EL6_P0 = 'M0.25 0.832031V23.1895H4.75V0.832031H0.25Z';
const EL6_P1 = 'M11 0.582031H5V23.4392H11V0.582031Z';
const EL6_P2 = 'M7 24H6V8.36793e-07H7V24Z';
const EL6_P3 = 'M9 24H8V8.36793e-07H9V24Z';
const EL6_P4 = 'M11 24H10V8.36793e-07H11V24Z';
const EL6_P5 = 'M13 16.0117H11V20.5831H13V16.0117Z';
const EL6_P6 = 'M13 6.86914H11V16.012H13V6.86914Z';
const EL6_P7 = 'M15 5.29688H13V19.0112H15V5.29688Z';
const EL6_P8 = 'M18.5352 10.5273H15.5703V13.0028H18.5352V10.5273Z';
const EL6_P9 = 'M15.5703 8.33789H14.9766V15.195H15.5703V8.33789Z';
const EL6_P10 = 'M13 3.43945H11V6.86802H13V3.43945Z';

// Build one end-cap assembly (el4 top, el2 middle, el3 bottom, el1 inner strip) at the given transform
function buildEndCap(tx, ty, sx, sy, el1Fill, el4Fill, el2Fill, el3Fill, outline) {
  return `<g transform="translate(${tx} ${ty}) scale(${sx} ${sy})">` +
    `<path d="${EL4_PATH}" fill="${el4Fill}" stroke="${outline}" stroke-width="0.4" opacity="0.95"/>` +
    `<path d="${EL2_PATH}" transform="translate(-0.4 9.5)" fill="${el2Fill}" opacity="0.95"/>` +
    `<path d="${EL3_PATH}" transform="translate(0 29.8)" fill="${el3Fill}" stroke="${outline}" stroke-width="0.4" opacity="0.95"/>` +
    `<path d="${EL1_PATH}" transform="translate(7.29 -2.5)" fill="${el1Fill}" stroke="${outline}" stroke-width="0.4" opacity="0.95"/>` +
    `</g>`;
}

// Build the thermostatic valve (el6) at (tx, ty). The connecting body uses the radiator's
// gradient (bodyTopColor→bodyBotColor); the bronze rings and black valve keep their real colours.
function buildEl6(tx, ty, bodyTopColor, bodyBotColor, outline, mirror = false) {
  const transform = mirror ? `translate(${tx} ${ty}) scale(-1 1)` : `translate(${tx} ${ty})`;
  return `<g transform="${transform}"><defs>` +
    `<linearGradient id="el6g0" x1="2.5" y1="0.582031" x2="2.5" y2="23.4392" gradientUnits="userSpaceOnUse"><stop offset="0.139" stop-color="${bodyTopColor}"/><stop offset="0.894" stop-color="${bodyBotColor}"/></linearGradient>` +
    `<linearGradient id="el6g1" x1="7.92686" y1="1.49413" x2="8.02239" y2="23.4391" gradientUnits="userSpaceOnUse"><stop offset="0.105769" stop-color="#A47741"/><stop offset="0.235577" stop-color="#C18D50"/><stop offset="0.360577" stop-color="#3E2D19"/></linearGradient>` +
    `<linearGradient id="el6g2" x1="6.5" y1="0" x2="6.5" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0.0961538" stop-color="#F6B261"/><stop offset="0.711538" stop-color="#FFC37C"/><stop offset="1" stop-color="#C28B49"/></linearGradient>` +
    `<linearGradient id="el6g3" x1="8.5" y1="0" x2="8.5" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0.0961538" stop-color="#F6B261"/><stop offset="0.711538" stop-color="#FFC37C"/><stop offset="1" stop-color="#C28B49"/></linearGradient>` +
    `<linearGradient id="el6g4" x1="10.5" y1="0" x2="10.5" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0.0961538" stop-color="#F6B261"/><stop offset="0.711538" stop-color="#FFC37C"/><stop offset="1" stop-color="#C28B49"/></linearGradient>` +
    `<linearGradient id="el6g5" x1="14" y1="11.9422" x2="14" y2="5.29688" gradientUnits="userSpaceOnUse"><stop stop-color="#231F20"/><stop offset="0.697115" stop-color="#A59599"/><stop offset="1" stop-color="#494244"/></linearGradient>` +
    `<linearGradient id="el6g6" x1="17.0527" y1="11.7268" x2="17.0527" y2="10.5273" gradientUnits="userSpaceOnUse"><stop stop-color="#61595B"/><stop offset="0.697115" stop-color="#EEDFE3"/><stop offset="1" stop-color="#494244"/></linearGradient>` +
    `</defs>` +
    `<path opacity="0.9" d="${EL6_P0}" fill="url(#el6g0)" stroke="${outline}" stroke-width="0.5"/>` +
    `<path opacity="0.9" d="${EL6_P1}" fill="url(#el6g1)"/>` +
    `<path opacity="0.9" d="${EL6_P2}" fill="url(#el6g2)"/>` +
    `<path opacity="0.9" d="${EL6_P3}" fill="url(#el6g3)"/>` +
    `<path opacity="0.9" d="${EL6_P4}" fill="url(#el6g4)"/>` +
    `<path opacity="0.9" d="${EL6_P5}" fill="#724A1E"/>` +
    `<path opacity="0.9" d="${EL6_P6}" fill="#AA7C48"/>` +
    `<path opacity="0.9" d="${EL6_P7}" fill="url(#el6g5)"/>` +
    `<path opacity="0.9" d="${EL6_P8}" fill="url(#el6g6)"/>` +
    `<path opacity="0.9" d="${EL6_P9}" fill="#A9C300"/>` +
    `<path opacity="0.9" d="${EL6_P10}" fill="#EDD8B9"/>` +
    `</g>`;
}

// Air vent (mv_r.svg) — 11×22 viewport; protrudes outward from the top manifold end cap
function buildVent(tx, ty, mirror) {
  const transform = mirror ? `translate(${tx + 11} ${ty}) scale(-1 1)` : `translate(${tx} ${ty})`;
  return `<defs>` +
    `<linearGradient id="ventg0" x1="6.48047" y1="18.7031" x2="6.48047" y2="1.73633" gradientUnits="userSpaceOnUse"><stop stop-color="#BFBFBF"/><stop offset="0.293269" stop-color="#E5E5E5"/><stop offset="1" stop-color="#AFAFAF"/></linearGradient>` +
    `<linearGradient id="ventg1" x1="9.12891" y1="13.0059" x2="9.12891" y2="7.00195" gradientUnits="userSpaceOnUse"><stop offset="0.129808" stop-color="#A2A09E"/><stop offset="0.341346" stop-color="#E5E5E5"/><stop offset="0.730769" stop-color="#A4A4A4"/><stop offset="1" stop-color="#3C3B3B"/></linearGradient>` +
    `</defs>` +
    `<g transform="${transform}">` +
    `<rect x="5" y="21.5566" width="5" height="5.24023" transform="rotate(-180 5 21.5566)" fill="#6C635D"/>` +
    `<rect x="5" y="5.24023" width="5" height="5.24023" transform="rotate(-180 5 5.24023)" fill="#979386"/>` +
    `<rect x="5" y="16.3164" width="5" height="11.0762" transform="rotate(-180 5 16.3164)" fill="#AEACA6"/>` +
    `<path d="M7.96094 17.7031C7.96094 18.2554 7.51322 18.7031 6.96094 18.7031H5V1.73633H6.96094C7.51322 1.73633 7.96094 2.18404 7.96094 2.73633V17.7031Z" fill="url(#ventg0)"/>` +
    `<path d="M10.2969 12.0059C10.2969 12.5581 9.84916 13.0059 9.29688 13.0059H7.96094V7.00195H9.29687C9.84916 7.00195 10.2969 7.44967 10.2969 8.00195V12.0059Z" fill="url(#ventg1)"/>` +
    `</g>`;
}

function buildLMarker(x, y) {
  return `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="22" fill="#CCFF00" text-anchor="middle" dominant-baseline="central">L</text>`;
}

// How far the tube's rounded cap protrudes beyond the manifold's outer edge
const PROTR = 6;

// Section pipe path, parametrised by height h
function buildPipePath(h) {
  const r = TUBE_R;
  const w = TUBE_W;
  const b = h - 0.25;
  const c1 = r + 6.7655;
  const c2 = r - 6.7655;
  return `M${r} ${b}C${c1} ${b} ${w - 0.25} ${h - c2} ${w - 0.25} ${h - r}V${r}C${w - 0.25} ${c2} ${c1} 0.25 ${r} 0.25C${c2} 0.25 0.25 ${c2} 0.25 ${r}V${h - r}C0.25 ${h - c2} ${c2} ${b} ${r} ${b}Z`;
}

// L3: distance from radiator left edge to the first (left) central-connection pipe.
// Even N: pipes straddle the centre. Odd N: N96 shifts right, N98 shifts left.
function calcL3(sections, cc) {
  if (sections % 2 === 0) return (sections / 2) * 45 - 25;
  if (cc === '98') return ((sections - 1) / 2) * 45 - 25;
  return ((sections + 1) / 2) * 45 - 25; // cc === '96'
}

function buildSvg(sections, H, cc, colorHex, valveType, ventSide, ventType) {
  const base = colorHex;
  const hi = lighten(base, 0.22);
  const sh = darken(base, 0.28);
  const outline = darken(base, 0.40);
  const accent = lighten(base, 0.40);

  const totalW = (sections - 1) * PITCH + ELEM_W;

  const p = [];

  // Gradients — manifold uses a strong vertical highlight matching the reference SVG
  p.push(`<defs>
    <linearGradient id="pipeG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${sh}"/><stop offset="22%" stop-color="${base}"/><stop offset="45%" stop-color="${hi}"/><stop offset="55%" stop-color="${hi}"/><stop offset="78%" stop-color="${base}"/><stop offset="100%" stop-color="${sh}"/>
    </linearGradient>
    <linearGradient id="mG" x1="0" y1="0" x2="0" y2="${ELEM_H}" gradientUnits="userSpaceOnUse">
      <stop offset="20%" stop-color="${accent}"/><stop offset="67%" stop-color="${base}"/>
    </linearGradient>
    <linearGradient id="mGBot" x1="0" y1="${H}" x2="0" y2="${H - ELEM_H}" gradientUnits="userSpaceOnUse">
      <stop offset="20%" stop-color="${accent}"/><stop offset="67%" stop-color="${base}"/>
    </linearGradient>
  </defs>`);

  // 0. Valve connection pipes (el5) — RRV bottom; drawn under the manifold layer
  if (cc === '89' || cc === '69' || cc === '96' || cc === '98' || cc === '68' || cc === '86') {
    const firstSecX = ELEM_W / 2;
    const lastSecX = (sections - 1) * PITCH + ELEM_W / 2;
    const pipeTopY = H - (EL5_H - EL5_PROTR); // top sits inside the manifold; 20 units protrude below
    let pipeLeftX, pipeRightX;
    if (cc === '89') {
      // N89: right side (lastSecX & lastSecX-50)
      pipeLeftX = lastSecX - 50; pipeRightX = lastSecX;
    } else if (cc === '69') {
      // N69: left side shifted 2mm outward (firstSecX-2 & firstSecX+48)
      pipeLeftX = firstSecX - 2; pipeRightX = firstSecX + 48;
    } else if (cc === '68' || cc === '86') {
      // N68/N86 — RRN bottom: pipes under the first & last sections, 22.5mm from each outer edge
      pipeLeftX = 22.5; pipeRightX = totalW - 22.5;
    } else {
      // N96/N98 — central connection; L3 from section-count parity (+0.5 adjusts for 46mm element width vs 45mm pitch)
      const L3 = calcL3(sections, cc);
      pipeLeftX = L3 + 0.5; pipeRightX = L3 + 50.5;
    }
    p.push(`<path d="${EL5_PATH}" transform="translate(${pipeLeftX - EL5_W / 2} ${pipeTopY})" fill="url(#pipeG)" stroke="${outline}" stroke-width="0.5"/>`);
    p.push(`<path d="${EL5_PATH}" transform="translate(${pipeRightX - EL5_W / 2} ${pipeTopY})" fill="url(#pipeG)" stroke="${outline}" stroke-width="0.5"/>`);
  }

  // 1. Top & bottom manifold elements (behind tubes) — placed per section at 45 mm pitch
  for (let i = 0; i < sections; i++) {
    const x = i * PITCH;
    p.push(`<path d="${MANIFOLD_PATH}" transform="translate(${x} 0)" fill="url(#mG)" stroke="${outline}" stroke-width="0.4"/>`);
    p.push(`<path d="${MANIFOLD_PATH}" transform="translate(${x} ${H}) scale(1 -1)" fill="url(#mGBot)" stroke="${outline}" stroke-width="0.4"/>`);
  }

  // 2. Vertical tubes (in front of manifolds), protruding beyond the collector edges
  const pipePathFull = buildPipePath(H + 2 * PROTR);
  for (let i = 0; i < sections; i++) {
    const x = i * PITCH + ELEM_W / 2 - TUBE_R;
    p.push(`<path d="${pipePathFull}" transform="translate(${x} ${-PROTR})" fill="url(#pipeG)" stroke="${outline}" stroke-width="0.5"/>`);
  }

  // 3. End caps (assembled from el1–el4); reducer (el1) abuts the hub edge, cap body set back
  const hubLeftX = 0.2;
  const hubRightX = (sections - 1) * PITCH + 45.6;
  const topCy = HUB_CY;
  const botCy = H - HUB_CY;
  const ecW = 11.67;
  const ecYTop = topCy - 21.5;
  const ecYBot = botCy - 21.5;
  const el3Fill = darken(base, 0.15);
  p.push(buildEndCap(hubLeftX - ecW, ecYTop, 1, 1, 'url(#mG)', hi, base, el3Fill, outline));
  p.push(buildEndCap(hubRightX + ecW, ecYTop, -1, 1, 'url(#mG)', hi, base, el3Fill, outline));
  p.push(buildEndCap(hubLeftX - ecW, ecYBot, 1, 1, 'url(#mGBot)', hi, base, el3Fill, outline));
  p.push(buildEndCap(hubRightX + ecW, ecYBot, -1, 1, 'url(#mGBot)', hi, base, el3Fill, outline));

  // 3b. Thermostatic valve (el6) — RRV N89/N96 (right, not mirrored) / N69/N98 (left, mirrored);
  // N89 & N69 flush against the end cap; N96 & N98 flush against the centre connection pipe.
  // Upper manifold for ТВВ, lower for ТВН.
  if ((cc === '89' || cc === '69' || cc === '96' || cc === '98') && (valveType === 'ТВВ' || valveType === 'ТВН')) {
    const isUpper = valveType === 'ТВВ';
    const el6Ty = (isUpper ? topCy : botCy) - 14;
    // N96 attaches to the right end cap (like N89); N98 to the left end cap (like N69)
    const mirror = (cc === '69' || cc === '98');
    const anchorX = mirror ? (hubLeftX - ecW) : (hubRightX + ecW);
    const el6Tx = mirror ? anchorX + 0.5 : anchorX - 0.5;
    p.push(buildEl6(el6Tx, el6Ty, accent, base, outline, mirror));
  }

  // 3c. Air vent (mv_l/mv_r) + "L" marker — on the top manifold end cap;
  // right for N12/N14/N68, left for N34/N32/N86, both for RRV N69 ТВН & N89 ТВН.
  // Vent visual only when ventType === '1'; "L" marker always shown at the vent/plug position.
  if (ventSide === 'left' || ventSide === 'right' || ventSide === 'both') {
    const ventY = topCy - 11;
    const hasVent = ventType === '1';
    if (ventSide === 'left' || ventSide === 'both') {
      if (hasVent) p.push(buildVent(hubLeftX - ecW - 11, ventY, true));
      p.push(buildLMarker(hubLeftX - ecW - 26, topCy));
    }
    if (ventSide === 'right' || ventSide === 'both') {
      if (hasVent) p.push(buildVent(hubRightX + ecW, ventY, false));
      p.push(buildLMarker(hubRightX + ecW + 26, topCy));
    }
  }

  // 4. Connection flow arrows
  const RED = '#E84545';
  const BLUE = '#4DABF7';
  // Arrow sizing — larger (~1.6× tube diameter), with a gap from the radiator
  const arrLen = clamp(TUBE_W * 1.6, 35, 55);
  const headLen = clamp(TUBE_W * 0.7, 12, 20);
  const headW = headLen * 0.7;
  const gap = arrLen * 0.35;
  const sw = clamp(H * 0.006, 2.5, 5);

  const firstX = ELEM_W / 2;
  const lastX = (sections - 1) * PITCH + ELEM_W / 2;
  const topY = HUB_CY;
  const botY = H - HUB_CY;

  // Arrow tips sit a "gap" away from the outer end-cap edges (no overlap)
  const leftTip = (hubLeftX - ecW) - gap;
  const rightTip = (hubRightX + ecW) + gap;
  const pipeProtr = (cc === '89' || cc === '69' || cc === '96' || cc === '98' || cc === '68' || cc === '86') ? EL5_PROTR : 0;
  const botTip = H + pipeProtr + gap;

  const hArr = (x1, x2, y, c) => {
    const d = x2 > x1 ? 1 : -1;
    const base = x2 - d * headLen;
    return `<line x1="${x1}" y1="${y}" x2="${base}" y2="${y}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/><polygon points="${base},${y - headW} ${x2},${y} ${base},${y + headW}" fill="${c}"/>`;
  };
  const vArr = (y1, y2, x, c) => {
    const d = y2 > y1 ? 1 : -1;
    const base = y2 - d * headLen;
    return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${base}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/><polygon points="${x - headW},${base} ${x},${y2} ${x + headW},${base}" fill="${c}"/>`;
  };

  let arrows = '';
  switch (cc) {
    case '12': arrows = hArr(leftTip - arrLen, leftTip, topY, RED) + hArr(leftTip, leftTip - arrLen, botY, BLUE); break;
    case '34': arrows = hArr(rightTip + arrLen, rightTip, topY, RED) + hArr(rightTip, rightTip + arrLen, botY, BLUE); break;
    case '14': arrows = hArr(leftTip - arrLen, leftTip, topY, RED) + hArr(rightTip, rightTip + arrLen, botY, BLUE); break;
    case '32': arrows = hArr(rightTip + arrLen, rightTip, topY, RED) + hArr(leftTip, leftTip - arrLen, botY, BLUE); break;
    case '68': arrows = vArr(botTip + arrLen, botTip, 22.5, RED) + vArr(botTip, botTip + arrLen, totalW - 22.5, BLUE); break;
    case '86': arrows = vArr(botTip + arrLen, botTip, totalW - 22.5, RED) + vArr(botTip, botTip + arrLen, 22.5, BLUE); break;
    case '69': arrows = vArr(botTip + arrLen, botTip, firstX - 2, RED) + vArr(botTip, botTip + arrLen, firstX + 48, BLUE); break;
    case '89': arrows = vArr(botTip + arrLen, botTip, lastX, RED) + vArr(botTip, botTip + arrLen, lastX - 50, BLUE); break;
    case '96': { const L3 = calcL3(sections, '96'); arrows = vArr(botTip + arrLen, botTip, L3 + 50.5, RED) + vArr(botTip, botTip + arrLen, L3 + 0.5, BLUE); break; }
    case '98': { const L3 = calcL3(sections, '98'); arrows = vArr(botTip + arrLen, botTip, L3 + 0.5, RED) + vArr(botTip, botTip + arrLen, L3 + 50.5, BLUE); break; }
    default: arrows = hArr(leftTip - arrLen, leftTip, topY, RED) + hArr(leftTip, leftTip - arrLen, botY, BLUE);
  }
  p.push(arrows);

  const pad = gap + arrLen + headW + HUB_R + 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${totalW + 2 * pad} ${H + 2 * pad}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${p.join('')}</svg>`;
}

Deno.serve(async (req) => {
  try {
    let params = {};
    if (req.method === 'GET') {
      const url = new URL(req.url);
      params = Object.fromEntries(url.searchParams.entries());
    } else {
      try { params = await req.json(); } catch (_e) { params = {}; }
    }
    const sections = clamp(parseInt(params.sections, 10) || 9, 2, 60);
    const H = Math.max(180, parseInt(params.height, 10) || 600);
    const connectionCode = String(params.connectionCode || 'N12').replace(/^N/i, '');
    const color = String(params.color || '#F4F4F4');
    const valveType = String(params.valveType || '');
    const ventSide = String(params.ventSide || '');
    const ventType = String(params.ventType || '');

    const svg = buildSvg(sections, H, connectionCode, color, valveType, ventSide, ventType);

    if (req.method === 'GET') {
      return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' }
      });
    }
    return Response.json({ svg });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});