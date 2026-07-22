import * as XLSX from 'xlsx';
import { findConnectionVariant } from './radiatorData';

// Header definition: [column, groupLabel, subLabel]
// groupLabel = null means single-level column (merge rows 1-2)
const HEADER = [
  { col: 'A', group: 'Поз.', sub: null },
  { col: 'B', group: 'Помещение', sub: null },
  { col: 'C', group: 'Количество', sub: null },
  { col: 'D', group: 'Модель', sub: null },
  { col: 'E', group: 'Монтажная длина в элементах/секциях', sub: null },
  { col: 'F', group: 'Подающий/ обратный трубопровод', sub: 'Виды подключения' },
  { col: 'G', group: null, sub: 'Расположение' },
  { col: 'H', group: null, sub: 'Диаметр подключения' },
  { col: 'I', group: 'Микровоздушник', sub: 'Исполнение' },
  { col: 'J', group: null, sub: 'Расположение' },
  { col: 'K', group: null, sub: 'Диаметр подключения' },
  { col: 'L', group: 'Опорожнение/Дренаж', sub: 'Исполнение' },
  { col: 'M', group: null, sub: 'Расположение' },
  { col: 'N', group: null, sub: 'Диаметр подключения' },
  { col: 'O', group: 'Рабочее давление', sub: null },
  { col: 'P', group: 'Арматура', sub: null },
  { col: 'Q', group: 'Крепление', sub: null },
  { col: 'R', group: 'Поверхность', sub: 'Обработка' },
  { col: 'S', group: null, sub: 'Цвет/ Номер цвета' },
  { col: 'T', group: null, sub: 'Монтаж' },
  { col: 'U', group: 'Специальное исполнение', sub: null },
];

function colToIndex(col) {
  let idx = 0;
  for (let i = 0; i < col.length; i++) {
    idx = idx * 26 + (col.charCodeAt(i) - 64);
  }
  return idx - 1; // 0-based
}

export async function generateExcelOrder(config) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([[], []]); // two empty header rows

  // Write header values
  HEADER.forEach(h => {
    const colIdx = colToIndex(h.col);
    if (h.group) {
      // Group header in row 0
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
      ws[cellRef] = { t: 's', v: h.group };
    }
    if (h.sub) {
      // Sub header in row 1
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: colIdx });
      ws[cellRef] = { t: 's', v: h.sub };
    }
  });

  // Build merges
  const merges = [];
  let i = 0;
  while (i < HEADER.length) {
    const h = HEADER[i];
    if (h.sub === null && h.group) {
      // Single-level: merge rows 0-1
      merges.push({ s: { r: 0, c: i }, e: { r: 1, c: i } });
      i++;
    } else if (h.group) {
      // Group with sub-columns: find span
      let j = i + 1;
      while (j < HEADER.length && HEADER[j].group === null) j++;
      merges.push({ s: { r: 0, c: i }, e: { r: 0, c: j - 1 } });
      i = j;
    } else {
      i++;
    }
  }
  ws['!merges'] = merges;

  // Column widths
  ws['!cols'] = [
    { wch: 5 },   // A Pos
    { wch: 10 },  // B Raum
    { wch: 8 },   // C Anzahl
    { wch: 16 },  // D Artikel
    { wch: 10 },  // E Baulänge
    { wch: 12 },  // F
    { wch: 10 },  // G
    { wch: 10 },  // H
    { wch: 10 },  // I
    { wch: 10 },  // J
    { wch: 10 },  // K
    { wch: 10 },  // L
    { wch: 10 },  // M
    { wch: 10 },  // N
    { wch: 10 },  // O
    { wch: 10 },  // P
    { wch: 8 },   // Q
    { wch: 10 },  // R
    { wch: 14 },  // S
    { wch: 8 },   // T
    { wch: 12 },  // U
  ];

  // --- Build data row (row index 2 = row 3 in Excel) ---
  const variant = findConnectionVariant(config.connGroup, config.connCode);
  const valveType = variant?.valveType || '';
  const connNum = String(config.connCode || '').replace(/^N/i, '').replace(/\D/g, '');
  const isRRV = config.radiatorType === 'RRV';
  const isDoubleVent = isRRV && ['89', '69'].includes(connNum) && valveType === 'ТВН';

  const position = isRRV
    ? (['69', '98'].includes(connNum) ? '3' : '1')
    : (['12', '14', '68'].includes(connNum) ? '3' : '1');

  const ventExec = config.ventType ? '1' : '4';
  const ventExecValue = isDoubleVent ? `${ventExec} / 3` : ventExec;
  const ventPosValue = isDoubleVent ? `1 / 3` : position;

  const connPrefix = isRRV ? '31' : '2';

  const drainExec = config.drainValve ? '4' : '';
  const drainPos = config.drainValve ? (position === '3' ? '4' : '2') : '';
  const drainSize = config.drainValve ? config.connSize : '';

  const NO_RAL_CODES = ['TF', 'ZN'];
  const WHITE_RAL_CODES = ['SL', 'ZL'];
  let colorStr;
  if (NO_RAL_CODES.includes(config.colorCode)) {
    colorStr = config.colorCode;
  } else if (WHITE_RAL_CODES.includes(config.colorCode)) {
    colorStr = `${config.colorCode} RAL 9016`;
  } else {
    colorStr = `${config.colorCode} RAL ${config.ralCode}`;
  }

  const pressure = config.highPressure ? '16' : '10';
  const fastening = config.includeBracketKLK ? 'KLK' : '';
  const articleValue = config.radiatorType === 'RRV' ? `${config.model}V` : config.model;

  const rowData = [
    1,                    // A: Поз.
    '',                   // B: Помещение
    config.quantity,      // C: Количество
    articleValue,         // D: Модель
    config.sections,      // E: Baulänge
    connPrefix,           // F: Anschlusstechnik
    connNum,              // G: Anordnung
    config.connSize,      // H: Anschlussgröße
    ventExecValue,        // I: vent Ausführung
    ventPosValue,         // J: vent Anordnung
    config.ventConnSize,  // K: vent Anschlussgröße
    drainExec,            // L: drain Ausführung
    drainPos,             // M: drain Anordnung
    drainSize,            // N: drain Anschlussgröße
    pressure,             // O: Druckausführung
    '',                   // P: Einbauten
    fastening,            // Q: Befestigung
    config.colorCode,     // R: Behandlung
    colorStr,             // S: Farbton
    '',                   // T: Montage
    '',                   // U: Sonderausführung
  ];

  XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: 2 });

  XLSX.utils.book_append_sheet(wb, ws, 'Bestellung');

  const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Заказ радиатора Kermi _${uniqueId}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}