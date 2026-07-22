import * as XLSX from 'xlsx';
import { findConnectionVariant } from './radiatorData';

const TEMPLATE_URL = 'https://media.base44.com/files/public/6a5dc0cf6f2847b3a26da201/e33a57af3_base.xlsx';

export async function generateExcelOrder(config) {
  const response = await fetch(TEMPLATE_URL);
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];

  const variant = findConnectionVariant(config.connGroup, config.connCode);
  const valveType = variant?.valveType || '';
  const connNum = String(config.connCode || '').replace(/^N/i, '').replace(/\D/g, '');
  const isRRV = config.radiatorType === 'RRV';
  const isDoubleVent = isRRV && ['89', '69'].includes(connNum) && valveType === 'ТВН';

  const position = isRRV
    ? (['69', '98'].includes(connNum) ? '3' : '1')
    : (['12', '14', '68'].includes(connNum) ? '3' : '1');

  const ventExec = config.ventType ? '1' : '4';
  const ventExecValue = isDoubleVent ? `${ventExec}_3` : ventExec;
  const ventPosValue = isDoubleVent ? '1_3' : position;

  const connPrefix = isRRV ? '31' : '2';

  const drainExec = config.drainValve ? '4' : '0';
  const drainPos = config.drainValve ? (position === '3' ? '4' : '2') : '0';
  const drainSize = config.drainValve ? config.connSize : '0';

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

  const rowData = [
    1,                    // A: Pos
    1,                    // B: Raum
    config.quantity,      // C: Anzahl
    config.model,         // D: Artikel/Modell
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
    '',                   // R: Behandlung
    colorStr,             // S: Farbton
    '',                   // T: Montage
    '',                   // U: Sonderausführung
  ];

  XLSX.utils.sheet_add_aoa(ws, [rowData], { origin: 'A10' });

  const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Заказ радиатора Kermi _${uniqueId}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}