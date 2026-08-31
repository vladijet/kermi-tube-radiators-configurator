// Mounting geometry rules (RRN / Cambiotherm; applied to RRV as the base scheme).
import { DEPTH_BY_TUBES } from './radiatorData';
import { getKlkBracketCount, getBracketPositions } from './modelLimits';

// Interaxis distance N = H − 70 mm
export function getInteraxisN(height) {
  return Number(height) - 70;
}

// Floor offset A (radiator bottom to floor) by row count (tubes)
const FLOOR_OFFSET_A = { 2: 80, 3: 80, 4: 110, 5: 135, 6: 150 };
export function getFloorOffsetA(tubes) {
  return FLOOR_OFFSET_A[tubes] ?? 80;
}

// Depth T from the tube count
export function getDepthT(tubes) {
  return DEPTH_BY_TUBES[tubes] ?? 65;
}

// Side-view wall-to-center distance D = T/2 + 30 (deferred side view)
export function getSideD(tubes) {
  return getDepthT(tubes) / 2 + 30;
}

// Console wall offset WA by tube count (deferred side view)
export function getWallOffsetWA(tubes) {
  return { 2: 30, 3: [35, 45], 4: [45, 60], 5: null, 6: null }[tubes] ?? null;
}

// Distance K (mm) between the outermost bracket centers
export function getBracketK(positions) {
  if (!positions || positions.length < 2) return 0;
  return (positions[positions.length - 1] - positions[0]) * 45;
}

export { getKlkBracketCount, getBracketPositions };