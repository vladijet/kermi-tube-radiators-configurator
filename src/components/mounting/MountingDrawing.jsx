import React from 'react';
import { SECTION_LENGTH } from '@/lib/radiatorData';
import { OFFSET_35, BRACKET_WIDTH_45, WALL_CLEARANCE_30 } from '@/lib/mountingGeometry';

// All geometry is in a normalized "visual" coordinate system. The radiator width
// is scaled so the front view always occupies ~520 visual units, which keeps text,
// strokes and dimension offsets visually consistent regardless of the radiator's
// real size. Dimension labels still show the real millimetre values.

const STROKE = '#374151';
const THIN = 0.8;
const MED = 1.2;
const FONT = 11;
const DIM = 16; // base offset of a dimension line from the object
const EXT = 6;  // extension-line overshoot

const RED = '#e84545';
const BLU = '#3b82f6';

function DimLine({ x1, y1, x2, y2, label, ext = EXT, extDir = -1 }) {
  const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let exts, labelEl;
  if (horiz) {
    const ey = ext * extDir;
    exts = (
      <>
        <line x1={x1} y1={y1} x2={x1} y2={y1 + ey} stroke={STROKE} strokeWidth={THIN} />
        <line x1={x2} y1={y2} x2={x2} y2={y2 + ey} stroke={STROKE} strokeWidth={THIN} />
      </>
    );
    const ly = y1 + ey + (extDir > 0 ? FONT + 1 : -2);
    labelEl = (
      <text x={mx} y={ly} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif">
        {label}
      </text>
    );
  } else {
    const ex = ext * extDir;
    exts = (
      <>
        <line x1={x1} y1={y1} x2={x1 + ex} y2={y1} stroke={STROKE} strokeWidth={THIN} />
        <line x1={x2} y1={y2} x2={x2 + ex} y2={y2} stroke={STROKE} strokeWidth={THIN} />
      </>
    );
    const lx = x1 + ex + (extDir > 0 ? 2 : -2);
    labelEl = (
      <text x={lx} y={my} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif"
        transform={`rotate(-90 ${lx} ${my})`}>
        {label}
      </text>
    );
  }
  return (
    <g>
      {exts}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth={MED}
        markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />
      {labelEl}
    </g>
  );
}

// Flow connection stubs: supply (red) + return (blue), placed per connection code.
function Connections({ code, rLeft, rRight, rTop, rBottom, mH, S, B }) {
  const num = (code || '').replace(/\D/g, '');
  const topY = rTop + mH * 0.5;
  const botY = rBottom - mH * 0.5;
  const stubL = 14, stubW = 7, a = 4.5;
  const elems = [];
  const hStub = (x, y, dir, color) => {
    const tip = x + dir * 6;
    elems.push(
      <g key={`h${elems.length}`}>
        <rect x={dir < 0 ? x - stubL : x} y={y - stubW / 2} width={stubL} height={stubW} rx={2}
          fill="#9ca3af" stroke="#6b7280" strokeWidth={THIN} />
        <polygon points={`${tip},${y} ${tip - dir * a},${y - a * 0.7} ${tip - dir * a},${y + a * 0.7}`} fill={color} />
      </g>
    );
  };
  const vStub = (x, y, dir, color) => {
    const tip = y + dir * 6;
    elems.push(
      <g key={`v${elems.length}`}>
        <rect x={x - stubW / 2} y={dir < 0 ? y - stubL : y} width={stubW} height={stubL} rx={2}
          fill="#9ca3af" stroke="#6b7280" strokeWidth={THIN} />
        <polygon points={`${x},${tip} ${x - a * 0.7},${tip - dir * a} ${x + a * 0.7},${tip - dir * a}`} fill={color} />
      </g>
    );
  };

  const side = { '12': ['L', 'L'], '34': ['R', 'R'], '14': ['L', 'R'], '32': ['R', 'L'] }[num];
  if (side) {
    const [s, r] = side;
    if (s === 'L') hStub(rLeft, topY, -1, RED); else hStub(rRight, topY, 1, RED);
    if (r === 'L') hStub(rLeft, botY, -1, BLU); else hStub(rRight, botY, 1, BLU);
  } else {
    const positions = {
      '68': [22.5, B - 22.5],
      '86': [B - 22.5, 22.5],
      '69': [22.5, 70],
      '89': [B - 22.5, B - 70],
      '96': [B / 2 + 25, B / 2 - 25],
      '98': [B / 2 - 25, B / 2 + 25],
    }[num];
    if (positions) {
      vStub(rLeft + positions[0] * S, rBottom, -1, RED);
      vStub(rLeft + positions[1] * S, rBottom, 1, BLU);
    }
  }
  return <>{elems}</>;
}

export default function MountingDrawing({ dims, connectionCode = 'N12', color = '#F4F4F4' }) {
  const { H, B, T, N, K, A, C, D, bracketPositions, screwSpacing } = dims;
  if (!H || !B) return null;

  const sections = Math.round(B / SECTION_LENGTH);
  const S = 520 / Math.max(B, 1); // visual units per mm; fixed front-view width
  const M = 26;

  // ---- front-view layout ----
  const rTop = M + DIM + 10;
  const rLeft = M + DIM + 10;
  const rW = B * S;
  const rH = H * S;
  const rRight = rLeft + rW;
  const rBottom = rTop + rH;
  const floorY = rBottom + A * S;
  const mH = Math.min(Math.max(rH * 0.1, 10), 26);

  const bracketCenters = bracketPositions.map((p) => rLeft + (p - 0.5) * SECTION_LENGTH * S);
  const firstBx = bracketCenters[0];
  const lastBx = bracketCenters[bracketCenters.length - 1];
  const bracketTop = rTop + 6 * S;
  const bracketH = rH - 12 * S;
  const bw = BRACKET_WIDTH_45 * S;

  const nOff = (H - N) / 2;
  const nTop = rTop + nOff * S;
  const nBottom = rBottom - nOff * S;

  // ---- side-view layout ----
  const sLeft = rRight + 72; // clears the N & A dimensions on the right
  const wallThick = 14;
  const wallX = sLeft;
  const wallRightX = wallX + wallThick;
  const radBackX = wallRightX + WALL_CLEARANCE_30 * S;
  const radFrontX = radBackX + T * S;
  const tubeCenterX = radBackX + (T / 2) * S;
  const topScrewY = rTop + OFFSET_35 * S;
  const bottomScrewY = topScrewY + screwSpacing * S;
  const sRight = radFrontX + DIM * 2.6 + 10;

  const kY = floorY + DIM * 0.9;
  const vbW = sRight + M;
  const vbH = Math.max(kY, floorY + DIM * 0.7) + FONT + M;

  const fLeft = rLeft - 14;
  const fRight = rRight + 30;
  const tubeW = 25 * S;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxHeight: '86vh' }} fontFamily="sans-serif">
      <defs>
        <marker id="dimArrowEnd" markerUnits="userSpaceOnUse" markerWidth={9} markerHeight={9}
          refX={4.5} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={STROKE} />
        </marker>
        <marker id="dimArrowStart" markerUnits="userSpaceOnUse" markerWidth={9} markerHeight={9}
          refX={4.5} refY={4.5} orient="auto">
          <path d="M9,0 L0,4.5 L9,9 z" fill={STROKE} />
        </marker>
        <pattern id="wallHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={6} stroke="#9ca3af" strokeWidth={0.9} />
        </pattern>
        <pattern id="floorHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={6} stroke="#bfbfbf" strokeWidth={0.8} />
        </pattern>
      </defs>

      {/* ============ FRONT VIEW ============ */}
      {/* floor */}
      <rect x={fLeft} y={floorY} width={fRight - fLeft} height={5} fill="#e6e6e6" />
      <rect x={fLeft} y={floorY} width={fRight - fLeft} height={5} fill="url(#floorHatch)" />
      <line x1={fLeft} y1={floorY} x2={fRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />

      {/* tubes */}
      {Array.from({ length: sections }).map((_, i) => {
        const cx = rLeft + (i + 0.5) * SECTION_LENGTH * S;
        return (
          <rect key={i} x={cx - tubeW / 2} y={rTop} width={tubeW} height={rH} rx={tubeW / 2}
            fill={color} stroke="#9ca3af" strokeWidth={THIN} />
        );
      })}
      {/* manifolds */}
      <rect x={rLeft} y={rTop} width={rW} height={mH} rx={4} fill={color} stroke="#9ca3af" strokeWidth={THIN} />
      <rect x={rLeft} y={rBottom - mH} width={rW} height={mH} rx={4} fill={color} stroke="#9ca3af" strokeWidth={THIN} />
      {/* end caps */}
      <rect x={rLeft - 6} y={rTop + mH * 0.25} width={6} height={mH * 0.5} rx={2} fill="#9ca3af" />
      <rect x={rRight} y={rTop + mH * 0.25} width={6} height={mH * 0.5} rx={2} fill="#9ca3af" />
      <rect x={rLeft - 6} y={rBottom - mH * 0.75} width={6} height={mH * 0.5} rx={2} fill="#9ca3af" />
      <rect x={rRight} y={rBottom - mH * 0.75} width={6} height={mH * 0.5} rx={2} fill="#9ca3af" />

      {/* connection flow stubs */}
      <Connections code={connectionCode} rLeft={rLeft} rRight={rRight} rTop={rTop} rBottom={rBottom}
        mH={mH} S={S} B={B} />

      {/* KLK brackets */}
      {bracketCenters.map((cx, i) => (
        <g key={`b${i}`}>
          <rect x={cx - bw / 2} y={bracketTop} width={bw} height={bracketH} rx={3}
            fill="#c0c4cc" stroke="#7a7a7a" strokeWidth={THIN} />
          <rect x={cx - bw / 2} y={bracketTop} width={bw} height={bracketH * 0.13} fill="#a8acb3" />
          <rect x={cx - bw / 2} y={bracketTop + bracketH * 0.87} width={bw} height={bracketH * 0.13} fill="#a8acb3" />
          <circle cx={cx} cy={bracketTop + bracketH * 0.12} r={2.2} fill="#555" />
          <circle cx={cx} cy={bracketTop + bracketH * 0.88} r={2.2} fill="#555" />
        </g>
      ))}

      {/* dimensions — front */}
      <DimLine x1={rLeft} y1={rTop} x2={rRight} y2={rTop} label={`B = ${B}`} ext={DIM} extDir={-1} />
      <DimLine x1={rLeft} y1={rTop} x2={rLeft} y2={rBottom} label={`H = ${H}`} ext={DIM} extDir={-1} />
      <DimLine x1={rRight} y1={nTop} x2={rRight} y2={nBottom} label={`N = ${N}`} ext={DIM} extDir={1} />
      <DimLine x1={rRight} y1={rBottom} x2={rRight} y2={floorY} label={`A = ${A}`} ext={DIM * 2.2} extDir={1} />
      {bracketCenters.length >= 2 && (
        <DimLine x1={firstBx} y1={kY} x2={lastBx} y2={kY} label={`K = ${K}`} ext={DIM * 0.9} extDir={1} />
      )}
      {bracketCenters.length >= 1 && (
        <DimLine x1={firstBx - bw / 2} y1={bracketTop} x2={firstBx + bw / 2} y2={bracketTop}
          label="45" ext={DIM * 0.5} extDir={-1} />
      )}

      {/* ============ SIDE VIEW ============ */}
      {/* wall */}
      <rect x={wallX} y={rTop - 26} width={wallThick} height={floorY - (rTop - 26) + 6} fill="#d1d1d1" />
      <rect x={wallX} y={rTop - 26} width={wallThick} height={floorY - (rTop - 26) + 6} fill="url(#wallHatch)" />
      <line x1={wallRightX} y1={rTop - 26} x2={wallRightX} y2={floorY + 6} stroke={STROKE} strokeWidth={THIN} />
      {/* floor */}
      <rect x={wallX} y={floorY} width={sRight - wallX} height={5} fill="#e6e6e6" />
      <rect x={wallX} y={floorY} width={sRight - wallX} height={5} fill="url(#floorHatch)" />
      <line x1={wallX} y1={floorY} x2={sRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />
      {/* bracket plate */}
      <rect x={wallRightX} y={bracketTop} width={10 * S} height={bracketH} rx={2}
        fill="#c0c4cc" stroke="#7a7a7a" strokeWidth={THIN} />
      {/* anchor screws */}
      <circle cx={wallRightX} cy={topScrewY} r={2.4} fill="#555" />
      <line x1={wallRightX - 4} y1={topScrewY} x2={wallRightX + 4} y2={topScrewY} stroke="#333" strokeWidth={0.8} />
      <circle cx={wallRightX} cy={bottomScrewY} r={2.4} fill="#555" />
      <line x1={wallRightX - 4} y1={bottomScrewY} x2={wallRightX + 4} y2={bottomScrewY} stroke="#333" strokeWidth={0.8} />
      {/* radiator depth profile */}
      <rect x={radBackX} y={rTop} width={T * S} height={rH} fill={color} stroke="#9ca3af" strokeWidth={THIN} />

      {/* dimensions — side */}
      <DimLine x1={radBackX} y1={rTop} x2={radFrontX} y2={rTop} label={`T = ${T}`} ext={DIM * 0.7} extDir={-1} />
      <DimLine x1={wallRightX} y1={rTop} x2={tubeCenterX} y2={rTop} label={`D = ${D}`} ext={DIM * 1.9} extDir={-1} />
      <DimLine x1={wallRightX} y1={floorY} x2={radBackX} y2={floorY} label="30" ext={DIM * 0.7} extDir={1} />
      <DimLine x1={radFrontX} y1={topScrewY} x2={radFrontX} y2={bottomScrewY} label={`${screwSpacing}`} ext={DIM} extDir={1} />
      <DimLine x1={radFrontX} y1={topScrewY} x2={radFrontX} y2={floorY} label={`C = ${C}`} ext={DIM * 2.3} extDir={1} />
    </svg>
  );
}