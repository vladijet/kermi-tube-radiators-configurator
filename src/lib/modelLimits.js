// Per-model section limits and KLK bracket data from Kermi DB I/2026 (new Standard tables).
// All models have min 6 sections; max varies by model (default 60).

const MAX_SECTIONS_OVERRIDE = {
  '2220': 42,
  '2250': 42, '2280': 42, '2300': 42,
  '3200': 58, '3220': 58,
  '3250': 30, '3280': 30, '3300': 30,
  '4150': 54, '4180': 54,
  '4200': 44, '4220': 44,
  '4250': 30, '4280': 30, '4300': 30,
  '5150': 30, '5180': 30, '5200': 30, '5220': 30,
  '5250': 22, '5280': 26, '5300': 26,
  '6150': 30, '6180': 30, '6200': 30, '6220': 22,
  '6250': 22, '6280': 22, '6300': 22,
};

// KLK bracket count — Standard column (source of truth for RRN / Cambiotherm / RRV).
// KLK is not supplied when height < 300 mm OR sections < 6.
// 2–4 columns (tubes 2,3,4)
const BANDS_2_4 = [
  // height 300–1000
  { hMax: 1000, bands: [[6, 28, 2], [29, 42, 3], [43, 52, 4], [53, 60, 5]] },
  // height >1000–2200
  { hMax: 2200, bands: [[6, 18, 2], [19, 30, 3], [31, 48, 4], [49, 60, 5]] },
  // height >2200–3000
  { hMax: 3000, bands: [[6, 18, 2], [19, 30, 3], [31, 42, 4], [43, 52, 5], [53, 60, 6]] },
];
// 5–6 columns (tubes 5,6)
const BANDS_5_6 = [
  // height 300–550
  { hMax: 550, bands: [[6, 12, 2], [13, 30, 3], [31, 40, 4], [41, 50, 5], [51, 60, 6]] },
  // height >550–1500
  { hMax: 1500, bands: [[6, 20, 2], [21, 30, 3], [31, 40, 4], [41, 50, 5], [51, 60, 6]] },
  // height >1500–3000
  { hMax: 3000, bands: [[6, 10, 2], [11, 18, 3], [19, 24, 4], [25, 30, 5], [31, 40, 6], [41, 50, 7], [51, 60, 8]] },
];

export function getMinSections() {
  return 6;
}

export function getMaxSections(model) {
  return MAX_SECTIONS_OVERRIDE[model] ?? 60;
}

// New KLK bracket count (Standard tables). Returns 0 when KLK is not supplied.
export function getKlkBracketCount(tubes, height, sections) {
  if (!height || height < 300 || !sections || sections < 6) return 0;
  const table = tubes >= 5 ? BANDS_5_6 : BANDS_2_4;
  const entry = table.find((t) => height <= t.hMax) || table[table.length - 1];
  for (const [from, to, count] of entry.bands) {
    if (sections >= from && sections <= to) return count;
  }
  return entry.bands[entry.bands.length - 1][2];
}

// Section indices (1-based) for bracket placement:
// outermost brackets on the 2nd section from the left and the 2nd-to-last section from the right;
// remaining brackets distributed evenly between them.
export function getBracketPositions(sections, count) {
  if (!count || count < 1 || sections < 4) return [];
  const first = 2;
  const last = sections - 1;
  if (count === 1) return [Math.round((first + last) / 2)];
  if (count === 2) return [first, last];
  const positions = [first];
  for (let i = 1; i <= count - 2; i++) {
    const pos = Math.round(first + ((last - first) * i) / (count - 1));
    positions.push(pos);
  }
  positions.push(last);
  return [...new Set(positions)].sort((a, b) => a - b);
}

// Back-compat alias so existing imports keep working with the new logic.
export function getBracketCount(tubes, height, sections) {
  return getKlkBracketCount(tubes, height, sections);
}