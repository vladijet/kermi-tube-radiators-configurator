import {
  RADIATOR_MODELS, SECTION_LENGTH,
  NOMINAL_DT, EXPONENT_N, HIGH_PRESSURE_SURCHARGE,
  findConnectionVariant, MODEL_TECH_DATA, COLOR_OPTIONS, VENT_TYPES, CONNECTION_SIZES
} from './radiatorData';
import { getMinSections, getMaxSections, getBracketCount } from './modelLimits';

export function calculateDeltaT(t1, t2, troom) {
  return ((Number(t1) + Number(t2)) / 2) - Number(troom);
}

export function getModelsByHeight(height) {
  return RADIATOR_MODELS.filter(m => m.height === Number(height));
}

export function calculateResults(height, requiredPower, deltaT) {
  if (!height || !requiredPower || deltaT <= 0) return [];
  const models = getModelsByHeight(height);

  return models.map(m => {
    const techData = MODEL_TECH_DATA[m.model];
    const exponentN = techData?.exponentN || EXPONENT_N;
    const powerFactor = Math.pow(deltaT / NOMINAL_DT, exponentN);
    const weightPerSection = techData?.weightPerSection || 0;
    const qRealPerSection = m.power * powerFactor;
    const sections = Math.max(getMinSections(), Math.ceil(requiredPower / qRealPerSection));
    if (sections > getMaxSections(m.model)) return null;
    return {
      ...m,
      sections,
      length: sections * SECTION_LENGTH,
      qRealPerSection: Math.round(qRealPerSection * 10) / 10,
      qNomTotal: m.power * sections,
      qRealTotal: Math.round(qRealPerSection * sections),
      basePrice: Math.round(m.price * sections * 100) / 100,
      totalWeight: Math.round(weightPerSection * sections * 10) / 10,
      bracketCount: getBracketCount(m.tubes, m.height, sections),
    };
  }).filter(Boolean).sort((a, b) => a.basePrice - b.basePrice);
}

export function calculateResultsBySize(height, length, deltaT) {
  if (!height || !length || deltaT <= 0) return [];
  const models = getModelsByHeight(height);
  const sections = Math.max(getMinSections(), Math.round(length / SECTION_LENGTH));

  return models.map(m => {
    if (sections > getMaxSections(m.model)) return null;
    const techData = MODEL_TECH_DATA[m.model];
    const exponentN = techData?.exponentN || EXPONENT_N;
    const powerFactor = Math.pow(deltaT / NOMINAL_DT, exponentN);
    const weightPerSection = techData?.weightPerSection || 0;
    const qRealPerSection = m.power * powerFactor;
    return {
      ...m,
      sections,
      length: sections * SECTION_LENGTH,
      qRealPerSection: Math.round(qRealPerSection * 10) / 10,
      qNomTotal: m.power * sections,
      qRealTotal: Math.round(qRealPerSection * sections),
      basePrice: Math.round(m.price * sections * 100) / 100,
      totalWeight: Math.round(weightPerSection * sections * 10) / 10,
      bracketCount: getBracketCount(m.tubes, m.height, sections),
    };
  }).filter(Boolean).sort((a, b) => a.basePrice - b.basePrice);
}

export function calculateTotalPrice(basePrice, colorCode, connectionGroupId, connectionCode, highPressure, ventType, valveType) {
  const colorOption = COLOR_OPTIONS.find(c => c.code === colorCode);
  const colorMarkup = colorOption ? basePrice * (colorOption.surcharge_percent / 100) : 0;
  const variant = findConnectionVariant(connectionGroupId, connectionCode);
  const connSurcharge = variant ? variant.surcharge : 0;
  const pressureMarkup = highPressure ? HIGH_PRESSURE_SURCHARGE : 0;
  const ventOption = VENT_TYPES.find(v => v.code === ventType);
  // N69 ТВН and N89 ТВН render vents on both sides — surcharge doubled
  const connNum = String(connectionCode || '').replace(/^N/i, '').replace(/\D/g, '');
  const isDoubleVent = (connNum === '69' || connNum === '89') && valveType === 'ТВН';
  const ventMarkup = ventOption ? ventOption.surcharge * (isDoubleVent ? 2 : 1) : 0;
  return Math.round((basePrice + colorMarkup + connSurcharge + pressureMarkup + ventMarkup) * 100) / 100;
}

export function buildArticle(series, model, sections, connectionGroupId, connectionCode, ralCode, colorCode, highPressure, ventType, ventPosition, connSize, includeBracketKLK) {
  const variant = findConnectionVariant(connectionGroupId, connectionCode);
  const connDisplay = variant?.valveType ? `${connectionCode} ${variant.valveType}` : (connectionCode || '');
  const connPrefix = series === 'RRV' ? '31' : '2';
  const connStr = `${connPrefix} / ${connDisplay} / ${connSize}`;
  const modelPart = model ? `${model} / ${sections}` : '';
  const NO_RAL_CODES = ['TF', 'ZN'];
  const WHITE_RAL_CODES = ['SL', 'ZL'];
  let colorPart;
  if (NO_RAL_CODES.includes(colorCode)) {
    colorPart = colorCode;
  } else if (WHITE_RAL_CODES.includes(colorCode)) {
    colorPart = `${colorCode} / RAL 9016`;
  } else {
    colorPart = `${colorCode} / RAL ${ralCode}`;
  }
  const parts = ['Kermi', series, modelPart, connStr, colorPart];
  if (highPressure) parts.push('16');
  if (includeBracketKLK) parts.push('KLK');
  return parts.filter(Boolean).join(' - ');
}

export function formatEuro(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2
  }).format(amount);
}