// Per-model section limits and bracket data from Kermi DB I/2026
// All models have min 6 sections; max varies by model (default 60)

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

// Bracket patterns: [fromSections, toSections, bracketSets]
const BRACKET_PATTERNS = [
  [[6,12,2],[13,30,3],[31,40,4],[41,50,5],[51,60,6],[61,70,7],[71,80,8],[81,90,9]],
  [[4,28,2],[29,42,3],[43,52,4],[53,64,5],[65,74,6],[75,90,7]],
  [[6,28,2],[29,42,3],[43,52,4],[53,64,5],[65,74,6],[75,90,7]],
  [[4,18,2],[19,30,3],[31,48,4],[49,60,5],[61,72,6],[73,84,7],[85,90,8]],
  [[6,18,2],[19,30,3],[31,48,4],[49,60,5],[61,72,6],[73,84,7],[85,90,8]],
  [[6,20,2],[21,30,3]],
  [[6,10,2],[11,18,3],[19,24,4],[25,30,5]],
];

function getBracketPatternIndex(tubes, height) {
  if (height >= 2500) {
    if (tubes <= 4) return -1;
    return 6;
  }
  if (height >= 1100) {
    if (tubes <= 3) return 3;
    if (tubes === 4) return 4;
    return 5;
  }
  if (tubes <= 3) return 1;
  if (tubes === 4) return 2;
  return 0;
}

export function getMinSections() {
  return 6;
}

export function getMaxSections(model) {
  return MAX_SECTIONS_OVERRIDE[model] ?? 60;
}

export function getBracketCount(tubes, height, sections) {
  const idx = getBracketPatternIndex(tubes, height);
  if (idx < 0) return null;
  const pattern = BRACKET_PATTERNS[idx];
  for (const [from, to, count] of pattern) {
    if (sections >= from && sections <= to) return count;
  }
  return null;
}