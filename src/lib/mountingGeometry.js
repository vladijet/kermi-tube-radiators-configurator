// Mounting geometry for the technical drawing on /mounting-scheme.
// All values are in millimetres and mirror the Kermi mounting reference.

import { SECTION_LENGTH, DEPTH_BY_TUBES } from '@/lib/radiatorData';
import { getKlkBracketCount, getBracketPositions } from '@/lib/modelLimits';

// Fixed constants from the Kermi mounting reference / user screenshot.
export const OFFSET_12 = 12;        // B dimension side offset
export const OFFSET_35 = 35;        // H dimension top/bottom offset
export const BRACKET_WIDTH_45 = 45; // KLK bracket plate width
export const SCREW_SPACING_100 = 100; // vertical distance between two anchor screws
export const WALL_CLEARANCE_30 = 30; // gap between wall and radiator bracket
export const A_FORMULA = 'T × 0,75';

// Interaxis offset N = H - OFFSET per series (Cambiotherm confirmed -70; RRN/RRV -50).
const N_OFFSET = { RRN: 50, RRV: 50, Cambiotherm: 70 };

// Parse a Kermi model code into tubes / height / depth.
// Model "XYYY": X = tubes (2-6), YYY = height / 10 (e.g. "3055" -> 3 tubes, 550 mm).
export function parseModel(model) {
  if (!model) return { tubes: 0, height: 0, depth: 0 };
  const tubes = parseInt(model[0], 10) || 0;
  const height = parseInt(model.slice(1), 10) * 10 || 0;
  const depth = DEPTH_BY_TUBES[tubes] || 0;
  return { tubes, height, depth };
}

// Compute every dimension shown on the mounting drawing.
export function getMountingDimensions({ model, series, sections, height, tubes: tubesParam }) {
  const parsed = parseModel(model);
  const tubes = tubesParam || parsed.tubes || 0;
  const H = Number(height) || parsed.height || 0;
  const T = DEPTH_BY_TUBES[tubes] || parsed.depth || 0;
  const B = (Number(sections) || 0) * SECTION_LENGTH;
  const offset = N_OFFSET[series] ?? 50;
  const N = Math.max(H - offset, 0);
  const A = Math.round(T * 0.75); // floor clearance

  const count = getKlkBracketCount(tubes, H, Number(sections) || 0);
  const positions = getBracketPositions(Number(sections) || 0, count);

  // K = spacing between outermost bracket centres (mm).
  let K = 0;
  if (positions.length >= 2) {
    K = (positions[positions.length - 1] - positions[0]) * SECTION_LENGTH;
  }

  // C = distance from top anchor screw to floor (top screw ~35 mm below radiator top).
  const topScrewOffset = OFFSET_35;
  const C = A + H - topScrewOffset;

  // D = wall face to tube centre = wall clearance + bracket plate + half depth.
  const bracketPlate = 10;
  const D = Math.round(WALL_CLEARANCE_30 + bracketPlate + T / 2);

  return {
    H, B, T, N, K, A, C, D,
    bracketPositions: positions,
    bracketCount: count,
    screwSpacing: SCREW_SPACING_100,
    sectionLength: SECTION_LENGTH,
  };
}