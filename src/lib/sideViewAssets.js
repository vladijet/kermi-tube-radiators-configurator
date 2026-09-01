// Official Kermi side-view asset layers + recolour helpers.
// The source assets ship in a lime palette; recolorAsset() remaps every lime
// colour to an RAL-derived shade of matching lightness rank, so the same
// layered geometry renders in any chosen RAL colour.

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function hexToRgb(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = 'F4F4F4';
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

export function darken(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

export function lighten(hex, amt) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}

// Source lime palette, sorted darkest -> lightest (11 ranks).
const LIME_PALETTE = [
  '#444E00', '#616F08', '#6B7C00', '#768803', '#AECA00',
  '#B2CE02', '#BDDA04', '#C0DE00', '#C3E200', '#DAF436', '#DFFF0E',
];

// 11 RAL-derived shades (darkest -> lightest) for a base colour.
export function ralShades(base) {
  return [
    darken(base, 0.55), darken(base, 0.42), darken(base, 0.38),
    darken(base, 0.28), darken(base, 0.22), darken(base, 0.16),
    darken(base, 0.12), base, lighten(base, 0.03),
    lighten(base, 0.06), lighten(base, 0.14),
  ];
}

// Replace every lime colour in a stored asset with the RAL shade of the same rank.
export function recolorAsset(svg, base) {
  const shades = ralShades(base);
  let out = svg;
  LIME_PALETTE.forEach((lime, i) => {
    const re = new RegExp(lime.slice(1), 'gi');
    out = out.replace(re, shades[i].slice(1));
  });
  return out;
}

// Make ids unique so the same asset can be embedded more than once.
export function uniquifyIds(svg, suffix) {
  return svg
    .replace(/id="([^"]+)"/g, `id="$1${suffix}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1${suffix})`);
}

// Hex bolt cap (top) — official asset inner SVG (73x77).
export const CAP_UP_INNER = `<g filter="url(#filter0_f_3021_12094)">
<path d="M70.9633 45.2324L20.022 47.2469C20.022 47.2469 19.681 49.3153 21.6851 54.0459C23.6891 58.7765 28.0562 60.1741 32.4242 62.737C36.7922 65.2999 46.288 64.7449 53.7527 62.737C61.2174 60.7291 66.3228 56.525 67.4338 54.0459C68.5447 51.5668 70.9633 45.2324 70.9633 45.2324Z" fill="#444E00"/>
</g>
<g filter="url(#filter1_f_3021_12094)">
<circle cx="43.7994" cy="31.7448" r="29.7448" fill="#BDDA04"/>
</g>
<g filter="url(#filter2_f_3021_12094)">
<path d="M72.4321 45.2324L21.4907 47.2469C21.4907 47.2469 21.1498 49.3153 23.1538 54.0459C25.1578 58.7765 29.5249 60.1741 33.8929 62.737C38.261 65.2999 47.7568 64.7449 55.2215 62.737C62.6862 60.7291 67.7916 56.525 68.9025 54.0459C70.0135 51.5668 72.4321 45.2324 72.4321 45.2324Z" fill="#444E00"/>
</g>
<g filter="url(#filter3_f_3021_12094)">
<circle cx="43.7911" cy="31.7442" r="25.9591" fill="#AECA00"/>
</g>
<g filter="url(#filter4_f_3021_12094)">
<path d="M43.6024 32.1191L62.241 32.1191C65.3202 32.1191 67.2447 35.4525 65.7051 38.1191L58.2758 50.9872C57.5612 52.2248 56.2407 52.9872 54.8117 52.9872L35.3341 52.9872C33.9051 52.9872 32.5846 52.2248 31.87 50.9872L24.4407 38.1191C22.9011 35.4525 24.8256 32.1191 27.9048 32.1191L43.6024 32.1191Z" fill="#616F08"/>
</g>
<g filter="url(#filter5_f_3021_12094)">
<path d="M31.5337 14.321C32.2483 13.0834 33.5688 12.321 34.9978 12.321L52.7254 12.321C54.1545 12.321 55.475 13.0834 56.1895 14.321L65.0533 29.6735C65.7678 30.9111 65.7678 32.4359 65.0533 33.6735L56.1895 49.026C55.475 50.2636 54.1545 51.026 52.7254 51.026L34.9978 51.026C33.5688 51.026 32.2483 50.2636 31.5337 49.026L22.67 33.6735C21.9554 32.4359 21.9554 30.9111 22.67 29.6735L31.5337 14.321Z" fill="#DAF436"/>
</g>
<g filter="url(#filter6_f_3021_12094)">
<path d="M31.8523 14.0726C32.5668 12.835 33.8873 12.0726 35.3164 12.0726L53.4118 12.0726C54.8408 12.0726 56.1613 12.835 56.8759 14.0726L65.9236 29.7437C66.6381 30.9813 66.6381 32.506 65.9236 33.7437L56.8759 49.4147C56.1613 50.6523 54.8408 51.4147 53.4118 51.4147L35.3164 51.4147C33.8873 51.4147 32.5668 50.6523 31.8523 49.4147L22.8046 33.7437C22.0901 32.506 22.0901 30.9813 22.8046 29.7437L31.8523 14.0726Z" fill="#C0DE00"/>
</g>
<g filter="url(#filter7_f_3021_12094)">
<path d="M21.6328 33.1445C22.5588 33.1444 23.4212 33.6159 23.9209 34.3955L33.0644 48.6607C33.7999 49.8082 35.0691 50.5022 36.432 50.5022L52.7537 50.5022C54.1179 50.5022 55.3882 49.8069 56.1233 48.6576L65.68 33.717C65.8815 33.4019 66.3018 33.3123 66.6144 33.5177C66.9249 33.7218 67.0106 34.1394 66.8055 34.4493L56.1296 50.5825C55.3889 51.7019 54.1361 52.3751 52.7938 52.3751L35.047 52.3751C33.6179 52.3751 32.2974 51.6127 31.5829 50.3751L21.6357 33.146C21.6351 33.145 21.634 33.1444 21.6328 33.1445Z" fill="#768803"/>
</g>
<g opacity="0.3" filter="url(#filter8_f_3021_12094)">
<path d="M66.9883 31.8418C66.0446 31.8419 65.1659 31.3615 64.6567 30.567L55.3168 15.9955C54.5813 14.8481 53.3122 14.1541 51.9492 14.1541L35.2341 14.1541C33.8698 14.1541 32.5996 14.8494 31.8644 15.9987L22.1036 31.2584C21.8982 31.5796 21.47 31.6709 21.1514 31.4615C20.835 31.2535 20.7476 30.828 20.9566 30.5122L31.8581 14.0382C32.5988 12.9188 33.8516 12.2456 35.1939 12.2456L53.3629 12.2456C54.792 12.2456 56.1125 13.008 56.827 14.2456L66.9854 31.8403C66.986 31.8413 66.9871 31.8419 66.9883 31.8418Z" fill="#768803" fill-opacity="0.8"/>
</g>
<g opacity="0.3" filter="url(#filter9_f_3021_12094)">
<path d="M66.0847 32.038L55.2613 15.0179C54.5272 13.8635 53.254 13.1644 51.886 13.1644L34.5487 13.1644C33.7978 13.1644 33.2725 12.4217 33.5227 11.7136C33.6759 11.2801 34.085 10.9896 34.5448 10.988L53.7419 10.9181C55.1144 10.9131 56.3936 11.6122 57.1307 12.7699L66.9635 28.215C67.7887 29.5113 67.3931 31.2322 66.0847 32.038Z" fill="#768803"/>
</g>
<defs>
<filter id="filter0_f_3021_12094" x="0" y="25.2324" width="90.9648" height="59.2246" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="10" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter1_f_3021_12094" x="12.0547" y="0" width="63.4883" height="63.4902" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter2_f_3021_12094" x="1.46875" y="25.2324" width="90.9648" height="59.2246" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="10" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter3_f_3021_12094" x="17.332" y="5.28516" width="52.918" height="52.918" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter4_f_3021_12094" x="18.8984" y="27.1191" width="52.3477" height="30.8672" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter5_f_3021_12094" x="21.6328" y="11.8203" width="44.457" height="39.7051" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter6_f_3021_12094" x="21.7695" y="11.5723" width="45.1914" height="40.3418" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter7_f_3021_12094" x="18.6328" y="30.1445" width="51.2852" height="25.2305" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter8_f_3021_12094" x="17.8438" y="9.24609" width="52.1445" height="25.5957" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12094"/>
</filter>
<filter id="filter9_f_3021_12094" x="30.4609" y="7.91797" width="39.9336" height="27.1191" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12094"/>
</filter>
</defs>`;

// Hex bolt cap (bottom) — official asset inner SVG (93x85).
export const CAP_DOWN_INNER = `<g opacity="0.6" filter="url(#filter0_f_3021_12105)">
<path d="M62.9453 38.3379H10C10 38.3379 12.5947 44.3554 14.6733 51.3275C16.7518 58.2996 20.2023 60.3594 24.7328 64.1367C29.2632 67.914 37.3524 67.096 45.0947 64.1367C52.837 61.1774 58.1323 54.9813 59.2845 51.3275C60.4368 47.6738 62.9453 38.3379 62.9453 38.3379Z" fill="#444E00"/>
</g>
<g filter="url(#filter1_f_3021_12105)">
<circle cx="35.9674" cy="31.7448" r="29.7448" fill="#BDDA04"/>
</g>
<g opacity="0.6" filter="url(#filter2_f_3021_12105)">
<path d="M62.9453 38.3379H10C10 38.3379 12.5947 44.3554 14.6733 51.3275C16.7518 58.2996 20.2023 60.3594 24.7328 64.1367C29.2632 67.914 37.3524 67.096 45.0947 64.1367C52.837 61.1774 58.1323 54.9813 59.2845 51.3275C60.4368 47.6738 62.9453 38.3379 62.9453 38.3379Z" fill="#444E00"/>
</g>
<g filter="url(#filter3_f_3021_12105)">
<circle cx="35.9591" cy="31.7442" r="25.9591" fill="#AECA00"/>
</g>
<g filter="url(#filter4_f_3021_12105)">
<path d="M35.7704 32.1191L54.409 32.1191C57.4882 32.1191 59.4127 35.4525 57.8731 38.1191L50.4437 50.9872C49.7292 52.2248 48.4087 52.9872 46.9796 52.9872L27.5021 52.9872C26.073 52.9872 24.7525 52.2248 24.038 50.9872L16.6086 38.1191C15.069 35.4525 16.9935 32.1191 20.0727 32.1191L35.7704 32.1191Z" fill="#616F08"/>
</g>
<g filter="url(#filter5_f_3021_12105)">
<path d="M23.7017 14.321C24.4162 13.0834 25.7367 12.321 27.1658 12.321L44.8934 12.321C46.3224 12.321 47.6429 13.0834 48.3575 14.321L57.2212 29.6735C57.9358 30.9111 57.9358 32.4359 57.2212 33.6735L48.3575 49.026C47.6429 50.2636 46.3224 51.026 44.8934 51.026L27.1658 51.026C25.7367 51.026 24.4162 50.2636 23.7017 49.026L14.8379 33.6735C14.1234 32.4359 14.1234 30.9111 14.8379 29.6735L23.7017 14.321Z" fill="#DAF436"/>
</g>
<g filter="url(#filter6_f_3021_12105)">
<path d="M24.0203 14.0726C24.7348 12.835 26.0553 12.0726 27.4844 12.0726L45.5797 12.0726C47.0088 12.0726 48.3293 12.835 49.0438 14.0726L58.0915 29.7437C58.8061 30.9813 58.8061 32.506 58.0915 33.7437L49.0438 49.4147C48.3293 50.6523 47.0088 51.4147 45.5797 51.4147L27.4844 51.4147C26.0553 51.4147 24.7348 50.6523 24.0203 49.4147L14.9726 33.7437C14.258 32.506 14.258 30.9813 14.9726 29.7437L24.0203 14.0726Z" fill="#C0DE00"/>
</g>
<g filter="url(#filter7_f_3021_12105)">
<path d="M13.8008 33.1484C14.7268 33.1483 15.5892 33.6198 16.0889 34.3994L25.2324 48.6646C25.9679 49.8121 27.2371 50.5061 28.6 50.5061L44.9216 50.5061C46.2859 50.5061 47.5561 49.8108 48.2913 48.6615L57.8479 33.7209C58.0495 33.4058 58.4697 33.3162 58.7823 33.5216C59.0929 33.7257 59.1786 34.1433 58.9735 34.4532L48.2976 50.5864C47.5568 51.7058 46.3041 52.379 44.9618 52.379L27.215 52.379C25.7859 52.379 24.4654 51.6166 23.7509 50.379L13.8036 33.1499C13.803 33.1489 13.8019 33.1483 13.8008 33.1484Z" fill="#768803"/>
</g>
<g opacity="0.3" filter="url(#filter8_f_3021_12105)">
<path d="M59.1562 31.8418C58.2126 31.8419 57.3339 31.3615 56.8247 30.567L47.4848 15.9955C46.7493 14.8481 45.4802 14.1541 44.1172 14.1541L27.402 14.1541C26.0377 14.1541 24.7675 14.8494 24.0324 15.9987L14.2716 31.2584C14.0662 31.5796 13.6379 31.6709 13.3194 31.4615C13.0029 31.2535 12.9156 30.828 13.1246 30.5122L24.0261 14.0382C24.7668 12.9188 26.0196 12.2456 27.3618 12.2456L45.5309 12.2456C46.96 12.2456 48.2805 13.008 48.995 14.2456L59.1533 31.8403C59.1539 31.8413 59.1551 31.8419 59.1562 31.8418Z" fill="#768803" fill-opacity="0.8"/>
</g>
<g opacity="0.3" filter="url(#filter9_f_3021_12105)">
<path d="M58.2527 32.0419L47.4293 15.0218C46.6952 13.8674 45.422 13.1683 44.0539 13.1683L26.7167 13.1683C25.9657 13.1683 25.4405 12.4256 25.6907 11.7175C25.8438 11.284 26.253 10.9935 26.7127 10.9919L45.9099 10.922C47.2824 10.917 48.5616 11.6161 49.2987 12.7739L59.1314 28.2189C59.9567 29.5152 59.5611 31.2361 58.2527 32.0419Z" fill="#768803"/>
</g>
<defs>
<filter id="filter0_f_3021_12105" x="0" y="28.3379" width="72.9453" height="48.334" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter1_f_3021_12105" x="4.22266" y="0" width="63.4883" height="63.4902" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter2_f_3021_12105" x="0" y="28.3379" width="72.9453" height="48.334" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter3_f_3021_12105" x="9.5" y="5.28516" width="52.918" height="52.918" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter4_f_3021_12105" x="11.0664" y="27.1191" width="52.3477" height="30.8672" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="2.5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter5_f_3021_12105" x="13.8008" y="11.8203" width="44.457" height="39.7051" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter6_f_3021_12105" x="13.9375" y="11.5723" width="45.1914" height="40.3418" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="0.25" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter7_f_3021_12105" x="10.8008" y="30.1484" width="51.2852" height="25.2305" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter8_f_3021_12105" x="10.0117" y="9.24609" width="52.1445" height="25.5957" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
<filter id="filter9_f_3021_12105" x="22.6289" y="7.92188" width="39.9336" height="27.1191" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="1.5" result="effect1_foregroundBlur_3021_12105"/>
</filter>
</defs>`;