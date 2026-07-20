// Kermi tubular radiator price list I/2026
// Nominal power at 90/70/20°C (ΔT = 60K) per DIN EN 442

export const SECTION_LENGTH = 45; // mm per section
export const MIN_SECTIONS = 6;
export const MAX_SECTIONS = 60;
export const NOMINAL_DT = 60; // K — (90+70)/2 - 20
export const EXPONENT_N = 1.3;
export const HIGH_PRESSURE_SURCHARGE = 227.53;

export const DEPTH_BY_TUBES = { 2: 65, 3: 105, 4: 145, 5: 185, 6: 225 };

export const RADIATOR_MODELS = [
  { model: '5018', tubes: 5, height: 180, depth: 185, power: 40, price: 29.91 },
  { model: '6018', tubes: 6, height: 180, depth: 225, power: 49, price: 34.61 },
  { model: '2019', tubes: 2, height: 190, depth: 65, power: 18, price: 19.99 },
  { model: '3019', tubes: 3, height: 190, depth: 105, power: 25, price: 21.34 },
  { model: '4019', tubes: 4, height: 190, depth: 145, power: 33, price: 24.17 },
  { model: '2026', tubes: 2, height: 260, depth: 65, power: 25, price: 20.56 },
  { model: '3026', tubes: 3, height: 260, depth: 105, power: 35, price: 22.12 },
  { model: '4026', tubes: 4, height: 260, depth: 145, power: 46, price: 24.66 },
  { model: '5026', tubes: 5, height: 260, depth: 185, power: 56, price: 30.07 },
  { model: '6026', tubes: 6, height: 260, depth: 225, power: 67, price: 34.99 },
  { model: '2030', tubes: 2, height: 300, depth: 65, power: 30, price: 20.91 },
  { model: '3030', tubes: 3, height: 300, depth: 105, power: 41, price: 22.69 },
  { model: '4030', tubes: 4, height: 300, depth: 145, power: 54, price: 25.09 },
  { model: '5030', tubes: 5, height: 300, depth: 185, power: 67, price: 30.01 },
  { model: '6030', tubes: 6, height: 300, depth: 225, power: 79, price: 35.03 },
  { model: '2035', tubes: 2, height: 350, depth: 65, power: 35, price: 21.31 },
  { model: '3035', tubes: 3, height: 350, depth: 105, power: 48, price: 23.38 },
  { model: '4035', tubes: 4, height: 350, depth: 145, power: 63, price: 25.99 },
  { model: '5035', tubes: 5, height: 350, depth: 185, power: 78, price: 30.60 },
  { model: '6035', tubes: 6, height: 350, depth: 225, power: 92, price: 36.04 },
  { model: '3037', tubes: 3, height: 370, depth: 105, power: 48, price: 24.12 },
  { model: '2040', tubes: 2, height: 400, depth: 65, power: 40, price: 21.51 },
  { model: '3040', tubes: 3, height: 400, depth: 105, power: 55, price: 24.17 },
  { model: '4040', tubes: 4, height: 400, depth: 145, power: 71, price: 26.48 },
  { model: '5040', tubes: 5, height: 400, depth: 185, power: 88, price: 31.58 },
  { model: '6040', tubes: 6, height: 400, depth: 225, power: 104, price: 37.11 },
  { model: '2045', tubes: 2, height: 450, depth: 65, power: 44, price: 22.06 },
  { model: '3045', tubes: 3, height: 450, depth: 105, power: 61, price: 24.76 },
  { model: '4045', tubes: 4, height: 450, depth: 145, power: 79, price: 27.62 },
  { model: '5045', tubes: 5, height: 450, depth: 185, power: 98, price: 32.95 },
  { model: '6045', tubes: 6, height: 450, depth: 225, power: 115, price: 38.53 },
  { model: '2050', tubes: 2, height: 500, depth: 65, power: 49, price: 22.67 },
  { model: '3050', tubes: 3, height: 500, depth: 105, power: 68, price: 25.54 },
  { model: '4050', tubes: 4, height: 500, depth: 145, power: 87, price: 28.44 },
  { model: '5050', tubes: 5, height: 500, depth: 185, power: 108, price: 33.60 },
  { model: '6050', tubes: 6, height: 500, depth: 225, power: 127, price: 39.53 },
  { model: '2055', tubes: 2, height: 550, depth: 65, power: 53, price: 23.05 },
  { model: '3055', tubes: 3, height: 550, depth: 105, power: 74, price: 26.28 },
  { model: '4055', tubes: 4, height: 550, depth: 145, power: 95, price: 29.67 },
  { model: '5055', tubes: 5, height: 550, depth: 185, power: 118, price: 34.82 },
  { model: '6055', tubes: 6, height: 550, depth: 225, power: 138, price: 41.38 },
  { model: '2057', tubes: 2, height: 570, depth: 65, power: 53, price: 23.69 },
  { model: '3057', tubes: 3, height: 570, depth: 105, power: 73, price: 27.06 },
  { model: '2060', tubes: 2, height: 600, depth: 65, power: 58, price: 23.73 },
  { model: '3060', tubes: 3, height: 600, depth: 105, power: 80, price: 27.08 },
  { model: '4060', tubes: 4, height: 600, depth: 145, power: 103, price: 30.64 },
  { model: '5060', tubes: 5, height: 600, depth: 185, power: 128, price: 36.41 },
  { model: '6060', tubes: 6, height: 600, depth: 225, power: 150, price: 42.92 },
  { model: '2090', tubes: 2, height: 900, depth: 65, power: 84, price: 26.31 },
  { model: '3090', tubes: 3, height: 900, depth: 105, power: 117, price: 31.27 },
  { model: '4090', tubes: 4, height: 900, depth: 145, power: 148, price: 40.15 },
  { model: '5090', tubes: 5, height: 900, depth: 185, power: 184, price: 47.54 },
  { model: '6090', tubes: 6, height: 900, depth: 225, power: 215, price: 55.04 },
  { model: '2100', tubes: 2, height: 1000, depth: 65, power: 93, price: 27.52 },
  { model: '3100', tubes: 3, height: 1000, depth: 105, power: 130, price: 32.80 },
  { model: '4100', tubes: 4, height: 1000, depth: 145, power: 164, price: 43.38 },
  { model: '5100', tubes: 5, height: 1000, depth: 185, power: 202, price: 50.68 },
  { model: '6100', tubes: 6, height: 1000, depth: 225, power: 237, price: 59.33 },
  { model: '2110', tubes: 2, height: 1100, depth: 65, power: 102, price: 28.65 },
  { model: '3110', tubes: 3, height: 1100, depth: 105, power: 141, price: 36.84 },
  { model: '4110', tubes: 4, height: 1100, depth: 145, power: 179, price: 47.94 },
  { model: '5110', tubes: 5, height: 1100, depth: 185, power: 219, price: 58.80 },
  { model: '6110', tubes: 6, height: 1100, depth: 225, power: 257, price: 69.96 },
  { model: '2120', tubes: 2, height: 1200, depth: 65, power: 111, price: 30.56 },
  { model: '3120', tubes: 3, height: 1200, depth: 105, power: 152, price: 43.08 },
  { model: '4120', tubes: 4, height: 1200, depth: 145, power: 193, price: 54.18 },
  { model: '5120', tubes: 5, height: 1200, depth: 185, power: 237, price: 68.04 },
  { model: '6120', tubes: 6, height: 1200, depth: 225, power: 278, price: 79.24 },
  { model: '2150', tubes: 2, height: 1500, depth: 65, power: 138, price: 39.08 },
  { model: '3150', tubes: 3, height: 1500, depth: 105, power: 187, price: 55.86 },
  { model: '4150', tubes: 4, height: 1500, depth: 145, power: 236, price: 72.97 },
  { model: '5150', tubes: 5, height: 1500, depth: 185, power: 286, price: 91.38 },
  { model: '6150', tubes: 6, height: 1500, depth: 225, power: 338, price: 108.84 },
  { model: '2180', tubes: 2, height: 1800, depth: 65, power: 164, price: 46.19 },
  { model: '3180', tubes: 3, height: 1800, depth: 105, power: 219, price: 68.88 },
  { model: '4180', tubes: 4, height: 1800, depth: 145, power: 277, price: 87.68 },
  { model: '5180', tubes: 5, height: 1800, depth: 185, power: 335, price: 107.50 },
  { model: '6180', tubes: 6, height: 1800, depth: 225, power: 395, price: 127.68 },
  { model: '2200', tubes: 2, height: 2000, depth: 65, power: 182, price: 51.69 },
  { model: '3200', tubes: 3, height: 2000, depth: 105, power: 241, price: 73.81 },
  { model: '4200', tubes: 4, height: 2000, depth: 145, power: 305, price: 97.13 },
  { model: '5200', tubes: 5, height: 2000, depth: 185, power: 365, price: 118.89 },
  { model: '6200', tubes: 6, height: 2000, depth: 225, power: 433, price: 140.77 },
  { model: '2220', tubes: 2, height: 2200, depth: 65, power: 199, price: 58.00 },
  { model: '3220', tubes: 3, height: 2200, depth: 105, power: 262, price: 84.05 },
  { model: '4220', tubes: 4, height: 2200, depth: 145, power: 332, price: 109.14 },
  { model: '5220', tubes: 5, height: 2200, depth: 185, power: 394, price: 133.66 },
  { model: '6220', tubes: 6, height: 2200, depth: 225, power: 469, price: 158.58 },
  { model: '2250', tubes: 2, height: 2500, depth: 65, power: 226, price: 64.33 },
  { model: '3250', tubes: 3, height: 2500, depth: 105, power: 293, price: 94.29 },
  { model: '4250', tubes: 4, height: 2500, depth: 145, power: 371, price: 121.28 },
  { model: '5250', tubes: 5, height: 2500, depth: 185, power: 436, price: 148.30 },
  { model: '6250', tubes: 6, height: 2500, depth: 225, power: 521, price: 176.51 },
  { model: '2280', tubes: 2, height: 2800, depth: 65, power: 253, price: 72.40 },
  { model: '3280', tubes: 3, height: 2800, depth: 105, power: 323, price: 105.02 },
  { model: '4280', tubes: 4, height: 2800, depth: 145, power: 409, price: 137.24 },
  { model: '5280', tubes: 5, height: 2800, depth: 185, power: 474, price: 164.90 },
  { model: '6280', tubes: 6, height: 2800, depth: 225, power: 571, price: 198.25 },
  { model: '2300', tubes: 2, height: 3000, depth: 65, power: 271, price: 77.35 },
  { model: '3300', tubes: 3, height: 3000, depth: 105, power: 341, price: 113.68 },
  { model: '4300', tubes: 4, height: 3000, depth: 145, power: 434, price: 146.91 },
  { model: '5300', tubes: 5, height: 3000, depth: 185, power: 500, price: 176.51 },
  { model: '6300', tubes: 6, height: 3000, depth: 225, power: 605, price: 211.08 },
];

// Per-model technical data from Kermi RRV standard DB (I/2026)
// exponentN: exponential coefficient for heat output recalculation
// weightPerSection: weight of one section in kg
export const MODEL_TECH_DATA = {
  '2019': { exponentN: 1.23, weightPerSection: 0.33 },
  '2026': { exponentN: 1.25, weightPerSection: 0.42 },
  '2030': { exponentN: 1.26, weightPerSection: 0.47 },
  '2035': { exponentN: 1.31, weightPerSection: 0.53 },
  '2040': { exponentN: 1.31, weightPerSection: 0.59 },
  '2045': { exponentN: 1.31, weightPerSection: 0.65 },
  '2050': { exponentN: 1.31, weightPerSection: 0.71 },
  '2055': { exponentN: 1.31, weightPerSection: 0.77 },
  '2057': { exponentN: 1.31, weightPerSection: 0.80 },
  '2060': { exponentN: 1.31, weightPerSection: 0.83 },
  '2075': { exponentN: 1.31, weightPerSection: 1.02 },
  '2090': { exponentN: 1.31, weightPerSection: 1.20 },
  '2100': { exponentN: 1.32, weightPerSection: 1.32 },
  '2110': { exponentN: 1.32, weightPerSection: 1.44 },
  '2120': { exponentN: 1.32, weightPerSection: 1.56 },
  '2150': { exponentN: 1.32, weightPerSection: 1.93 },
  '2180': { exponentN: 1.32, weightPerSection: 2.29 },
  '2200': { exponentN: 1.32, weightPerSection: 2.53 },
  '2220': { exponentN: 1.32, weightPerSection: 2.78 },
  '2250': { exponentN: 1.32, weightPerSection: 3.14 },
  '2280': { exponentN: 1.33, weightPerSection: 3.50 },
  '2300': { exponentN: 1.33, weightPerSection: 3.75 },
  '3019': { exponentN: 1.27, weightPerSection: 0.50 },
  '3026': { exponentN: 1.31, weightPerSection: 0.63 },
  '3030': { exponentN: 1.33, weightPerSection: 0.70 },
  '3035': { exponentN: 1.36, weightPerSection: 0.79 },
  '3037': { exponentN: 1.36, weightPerSection: 0.83 },
  '3040': { exponentN: 1.36, weightPerSection: 0.88 },
  '3045': { exponentN: 1.36, weightPerSection: 0.97 },
  '3050': { exponentN: 1.36, weightPerSection: 1.06 },
  '3055': { exponentN: 1.36, weightPerSection: 1.16 },
  '3057': { exponentN: 1.36, weightPerSection: 1.21 },
  '3060': { exponentN: 1.36, weightPerSection: 1.25 },
  '3075': { exponentN: 1.36, weightPerSection: 1.52 },
  '3090': { exponentN: 1.36, weightPerSection: 1.79 },
  '3100': { exponentN: 1.36, weightPerSection: 1.98 },
  '3110': { exponentN: 1.35, weightPerSection: 2.16 },
  '3120': { exponentN: 1.35, weightPerSection: 2.34 },
  '3150': { exponentN: 1.35, weightPerSection: 2.89 },
  '3180': { exponentN: 1.35, weightPerSection: 3.43 },
  '3200': { exponentN: 1.34, weightPerSection: 3.80 },
  '3220': { exponentN: 1.34, weightPerSection: 4.16 },
  '3250': { exponentN: 1.34, weightPerSection: 4.71 },
  '3280': { exponentN: 1.34, weightPerSection: 5.25 },
  '3300': { exponentN: 1.33, weightPerSection: 5.62 },
  '4019': { exponentN: 1.25, weightPerSection: 0.66 },
  '4026': { exponentN: 1.30, weightPerSection: 0.84 },
  '4030': { exponentN: 1.33, weightPerSection: 0.93 },
  '4035': { exponentN: 1.35, weightPerSection: 1.06 },
  '4040': { exponentN: 1.35, weightPerSection: 1.18 },
  '4045': { exponentN: 1.35, weightPerSection: 1.30 },
  '4050': { exponentN: 1.35, weightPerSection: 1.42 },
  '4055': { exponentN: 1.35, weightPerSection: 1.54 },
  '4060': { exponentN: 1.35, weightPerSection: 1.66 },
  '4075': { exponentN: 1.35, weightPerSection: 2.03 },
  '4090': { exponentN: 1.35, weightPerSection: 2.39 },
  '4100': { exponentN: 1.35, weightPerSection: 2.63 },
  '4110': { exponentN: 1.35, weightPerSection: 2.88 },
  '4120': { exponentN: 1.35, weightPerSection: 3.12 },
  '4150': { exponentN: 1.35, weightPerSection: 3.85 },
  '4180': { exponentN: 1.34, weightPerSection: 4.58 },
  '4200': { exponentN: 1.34, weightPerSection: 5.06 },
  '4220': { exponentN: 1.34, weightPerSection: 5.55 },
  '4250': { exponentN: 1.34, weightPerSection: 6.27 },
  '4280': { exponentN: 1.34, weightPerSection: 7.00 },
  '4300': { exponentN: 1.34, weightPerSection: 7.49 },
  '5018': { exponentN: 1.29, weightPerSection: 0.89 },
  '5026': { exponentN: 1.33, weightPerSection: 1.11 },
  '5030': { exponentN: 1.36, weightPerSection: 1.23 },
  '5035': { exponentN: 1.39, weightPerSection: 1.38 },
  '5040': { exponentN: 1.39, weightPerSection: 1.53 },
  '5045': { exponentN: 1.39, weightPerSection: 1.68 },
  '5050': { exponentN: 1.39, weightPerSection: 1.83 },
  '5055': { exponentN: 1.39, weightPerSection: 1.99 },
  '5060': { exponentN: 1.39, weightPerSection: 2.14 },
  '5075': { exponentN: 1.39, weightPerSection: 2.59 },
  '5090': { exponentN: 1.39, weightPerSection: 3.05 },
  '5100': { exponentN: 1.38, weightPerSection: 3.35 },
  '5110': { exponentN: 1.38, weightPerSection: 3.65 },
  '5120': { exponentN: 1.38, weightPerSection: 3.96 },
  '5150': { exponentN: 1.37, weightPerSection: 4.87 },
  '5180': { exponentN: 1.37, weightPerSection: 5.78 },
  '5200': { exponentN: 1.37, weightPerSection: 6.38 },
  '5220': { exponentN: 1.36, weightPerSection: 6.99 },
  '5250': { exponentN: 1.36, weightPerSection: 7.90 },
  '5280': { exponentN: 1.35, weightPerSection: 8.81 },
  '5300': { exponentN: 1.35, weightPerSection: 9.42 },
  '6018': { exponentN: 1.31, weightPerSection: 1.08 },
  '6026': { exponentN: 1.36, weightPerSection: 1.34 },
  '6030': { exponentN: 1.39, weightPerSection: 1.49 },
  '6035': { exponentN: 1.41, weightPerSection: 1.67 },
  '6040': { exponentN: 1.41, weightPerSection: 1.85 },
  '6045': { exponentN: 1.41, weightPerSection: 2.03 },
  '6050': { exponentN: 1.41, weightPerSection: 2.21 },
  '6055': { exponentN: 1.41, weightPerSection: 2.40 },
  '6060': { exponentN: 1.41, weightPerSection: 2.58 },
  '6075': { exponentN: 1.40, weightPerSection: 3.12 },
  '6090': { exponentN: 1.40, weightPerSection: 3.67 },
  '6100': { exponentN: 1.40, weightPerSection: 4.03 },
  '6110': { exponentN: 1.40, weightPerSection: 4.40 },
  '6120': { exponentN: 1.40, weightPerSection: 4.76 },
  '6150': { exponentN: 1.40, weightPerSection: 5.85 },
  '6180': { exponentN: 1.39, weightPerSection: 6.95 },
  '6200': { exponentN: 1.39, weightPerSection: 7.67 },
  '6220': { exponentN: 1.39, weightPerSection: 8.40 },
  '6250': { exponentN: 1.39, weightPerSection: 9.49 },
  '6280': { exponentN: 1.38, weightPerSection: 10.59 },
  '6300': { exponentN: 1.38, weightPerSection: 11.31 },
};

export const AVAILABLE_HEIGHTS = [...new Set(RADIATOR_MODELS.map(m => m.height))].sort((a, b) => a - b);

export const COLOR_OPTIONS = [
  { code: 'AF', label: 'Стандартный белый All Finish', short: 'Белый AF', surcharge_percent: 0 },
  { code: 'CF', label: 'Color Finish (RAL, санитарные цвета)', short: 'Color Finish', surcharge_percent: 15 },
  { code: 'TF', label: 'Прозрачный лак Techno Farbe', short: 'Techno Farbe', surcharge_percent: 25 },
  { code: 'SL', label: 'Структурная окраска белая', short: 'Structure SL', surcharge_percent: 25 },
  { code: 'ZN', label: 'Оцинкованное, без покрытия', short: 'Оцинк. ZN', surcharge_percent: 225 },
  { code: 'ZL', label: 'Оцинк. + структурная белая', short: 'Оцинк.+SL', surcharge_percent: 225 },
  { code: 'ZK', label: 'Оцинк. + структурная цветная', short: 'Оцинк.+цв.', surcharge_percent: 225 },
];

// Air vent types (I8I — Исполнение)
export const VENT_TYPES = [
  { code: '1', label: 'Встроенный воздухоотводчик', surcharge: 17 },
  { code: '4', label: 'Штуцер под воздухоотводчик', surcharge: 0 },
];

// Connection sizes (размер подключения)
// rrvCode — код размера для серии RRV (только 1/2" и 3/4")
export const CONNECTION_SIZES = [
  { code: '38', label: '3/8"', surcharge: 0 },
  { code: '12', label: '1/2"', surcharge: 0, rrvCode: '12' },
  { code: '34', label: '3/4"', surcharge: 0, rrvCode: '84' },
  { code: '10', label: '1"', surcharge: 0 },
];

// Per-connection-code size restrictions for RRN (numeric part of connCode)
export const CONNECTION_SIZE_RESTRICTIONS = {
  '68': ['38', '12', '34'],
  '86': ['38', '12', '34'],
  '69': ['38', '12'],
  '89': ['38', '12'],
};

// Air vent positions (I9I — Расположение)
export const VENT_POSITIONS = [
  { code: '-', label: 'Заводская позиция', standard: true },
  { code: '5', label: 'Верх левый' },
  { code: '7', label: 'Верх правый' },
  { code: '1', label: 'Низ левый' },
  { code: '3', label: 'Низ правый' },
];

// Recommended vent positions by connection code (numeric part)
export const VENT_POSITION_BY_CONNECTION = {
  '12': ['5', '7'], '34': ['5', '7'], '14': ['5', '7'], '32': ['5', '7'],
  '13': ['5', '7'], '23': ['5', '7'], '24': ['5', '7'], '42': ['5', '7'],
  '68': ['5', '7'], '86': ['5', '7'], '69': ['5', '7'], '89': ['5', '7'],
  '96': ['5', '7'], '98': ['5', '7'],
  '31': ['5'],
  '41': ['7'],
  '57': ['5', '7', '1', '3'], '75': ['5', '7', '1', '3'],
  '58': ['5', '7', '1', '3'], '76': ['5', '7', '1', '3'],
  '67': ['5', '7', '1', '3'], '85': ['5', '7', '1', '3'],
};

export function getRecommendedVentPositions(connCode) {
  const num = (connCode || '').replace(/\D/g, '');
  return VENT_POSITION_BY_CONNECTION[num] || ['5', '7'];
}

export const CONNECTION_GROUPS = [
  {
    id: 'side',
    label: 'Боковое подключение',
    variants: [
      { code: 'N12', label: 'Слева', surcharge: 0, valveType: '' },
      { code: 'N34', label: 'Справа', surcharge: 0, valveType: '' },
      { code: 'N14', label: 'Двухстороннее', surcharge: 0, valveType: '' },
      { code: 'N32', label: 'Двухстороннее (2)', surcharge: 0, valveType: '' },
    ]
  },
  {
    id: 'bottom',
    label: 'Нижнее подключение',
    variants: [
      { code: 'N68', label: 'Слева', surcharge: 72.77, valveType: '' },
      { code: 'N86', label: 'Справа', surcharge: 72.77, valveType: '' },
      { code: 'N69', label: 'Слева (50мм)', surcharge: 72.77, valveType: '' },
      { code: 'N89', label: 'Справа (50мм)', surcharge: 72.77, valveType: '' },
    ]
  },
  {
    id: 'valve_tvv',
    label: 'Нижнее с термовентилем ТВВ',
    variants: [
      { code: 'N69', label: 'Слева', surcharge: 155.69, valveType: 'ТВВ' },
      { code: 'N89', label: 'Справа', surcharge: 155.69, valveType: 'ТВВ' },
      { code: 'N96', label: 'Центр', surcharge: 227.71, valveType: 'ТВВ' },
      { code: 'N98', label: 'Центр (2)', surcharge: 227.71, valveType: 'ТВВ' },
    ]
  },
  {
    id: 'valve_tvn',
    label: 'Нижнее с термовентилем ТВН',
    variants: [
      { code: 'N69', label: 'Слева', surcharge: 218.80, valveType: 'ТВН' },
      { code: 'N89', label: 'Справа', surcharge: 218.80, valveType: 'ТВН' },
      { code: 'N96', label: 'Центр', surcharge: 342.74, valveType: 'ТВН' },
      { code: 'N98', label: 'Центр (2)', surcharge: 342.74, valveType: 'ТВН' },
    ]
  },
];

export function findConnectionVariant(groupId, code) {
  const group = CONNECTION_GROUPS.find(g => g.id === groupId);
  if (!group) return null;
  return group.variants.find(v => v.code === code) || null;
}

export function getDefaultConnectionVariant(groupId) {
  const group = CONNECTION_GROUPS.find(g => g.id === groupId);
  if (!group || !group.variants.length) return null;
  return group.variants[0];
}

export const CAMBIOTHERM_HEIGHTS = [270, 370, 570, 770, 870, 970, 1070];

export const RADIATOR_TYPES = [
  {
    id: 'RRN',
    name: 'RRN без вентиля',
    image: 'https://media.base44.com/images/public/6a45366d13c007bdd7e17353/99a1f5ee1_KermiRRN5.png',
    description: 'Поставляется с боковым подключением без встроенного термовентиля. 5 вариантов монтажной глубины: 65–225 мм (2–6 трубчатых секций). 21 вариант монтажной высоты: 180–3000 мм. Может быть окрашен в любой цвет по RAL.',
    tags: ['Боковое', 'Без вентиля'],
    connectionGroupIds: ['side', 'bottom'],
  },
  {
    id: 'RRV',
    name: 'RRV с вентилем',
    image: 'https://media.base44.com/images/public/6a45366d13c007bdd7e17353/6ec051496_KermiRRV2.png',
    description: 'Поставляется с нижним подключением со встроенным термовентилем. 5 вариантов монтажной глубины: 65–225 мм (2–6 трубчатых секций). 2-трубное подключение внизу с расстоянием между центрами ниппелей 50 мм. Диаметр подключения: внутренняя резьба G ½". 21 вариант монтажной высоты: 180–3000 мм. Может быть окрашен в любой цвет по RAL.',
    tags: ['Нижнее', 'С вентилем'],
    connectionGroupIds: ['valve_tvv', 'valve_tvn'],
  },
  {
    id: 'Cambiotherm',
    name: 'Cambiotherm',
    image: 'https://media.base44.com/images/public/6a45366d13c007bdd7e17353/d8e7d3e51_KermiCambiothermRRN.png',
    description: 'С боковым подключением без встроенного термовентиля – идеальная замена старым стальным и чугунным радиаторам, благодаря точному межосевому расстоянию. Открытые подключения (4 х ½") обеспечивают оптимальную универсальность при замене и устанавливаются за несколько операций. 5 вариантов монтажной глубины: 65–225 мм (2–6-трубчатые радиаторы). 7 вариантов монтажной высоты: 270–1070 мм (межосевое расстояние: 200–1000 мм).',
    tags: ['Боковое', 'Без вентиля'],
    connectionGroupIds: ['side'],
  },
];

export function getConnectionVariantsForType(typeId) {
  const type = RADIATOR_TYPES.find(t => t.id === typeId);
  if (!type) return [];
  return type.connectionGroupIds.flatMap(gid => {
    const group = CONNECTION_GROUPS.find(g => g.id === gid);
    return group ? group.variants.map(v => ({ ...v, groupId: gid, groupLabel: group.label })) : [];
  });
}