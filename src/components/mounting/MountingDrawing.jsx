import React from 'react';
import { FrontBracket } from '@/components/mounting/KlkBrackets';
import { SECTION_LENGTH as SL } from '@/lib/radiatorData';
import {
  OFFSET_12, OFFSET_35, BRACKET_WIDTH_45, WALL_CLEARANCE_30, A_FORMULA,
} from '@/lib/mountingGeometry';

// Extract inner content + viewBox from a server-rendered <svg> string.
function parseServerSvg(svgStr) {
  if (!svgStr) return { viewBox: '0 0 100 100', inner: '' };
  const openEnd = svgStr.indexOf('>');
  const closeIdx = svgStr.lastIndexOf('</svg>');
  const inner = svgStr.slice(openEnd + 1, closeIdx);
  const vb = svgStr.match(/viewBox=["']([^"']+)["']/);
  return { viewBox: vb ? vb[1] : '0 0 100 100', inner };
}

const STROKE = '#666666';
const THIN = 0.3;
const MED = 0.4;
const FONT = 3.4;

// Horizontal or vertical dimension line with extension lines, double arrows and a label.
function DimLine({ x1, y1, x2, y2, label, ext = 4, extDir = -1 }) {
  const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  let exts;
  let labelEl;
  if (horiz) {
    const ey = ext * extDir;
    exts = <>
      <line x1={x1} y1={y1} x2={x1} y2={y1 + ey} stroke={STROKE} strokeWidth={THIN} />
      <line x1={x2} y1={y2} x2={x2} y2={y2 + ey} stroke={STROKE} strokeWidth={THIN} />
    </>;
    const ly = y1 + ey + (extDir > 0 ? FONT + 0.3 : -0.6);
    labelEl = <text x={mx} y={ly} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif">{label}</text>;
  } else {
    const ex = ext * extDir;
    exts = <>
      <line x1={x1} y1={y1} x2={x1 + ex} y2={y1} stroke={STROKE} strokeWidth={THIN} />
      <line x1={x2} y1={y2} x2={x2 + ex} y2={y2} stroke={STROKE} strokeWidth={THIN} />
    </>;
    const lx = x1 + ex + (extDir > 0 ? 0.6 : -0.6);
    labelEl = (
      <text x={lx} y={my} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif"
        transform={`rotate(-90 ${lx} ${my})`}>{label}</text>
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

export default function MountingDrawing({ serverSvg, dims, color = '#F4F4F4' }) {
  const { viewBox, inner } = parseServerSvg(serverSvg);
  const { H, B, T, N, K, A, C, D, bracketPositions, screwSpacing } = dims;
  const SLen = SL;

  // ---- layout (millimetres) ----
  const M = 24;
  const rTop = M + 16;
  const rLeft = M + 16;
  const rBottom = rTop + H;
  const rRight = rLeft + B;
  const floorY = rBottom + A;

  const bracketCenters = bracketPositions.map((p) => rLeft + (p - 0.5) * SLen);
  const firstBx = bracketCenters[0];
  const lastBx = bracketCenters[bracketCenters.length - 1];

  const frontRight = rRight + 34;
  const frontBottom = floorY + 8;

  // side view
  const sLeft = frontRight + 30;
  const wallThick = 12;
  const wallX = sLeft;
  const wallRightX = wallX + wallThick;
  const bracketPlate = 10;
  const radBackX = wallRightX + WALL_CLEARANCE_30 + bracketPlate;
  const radFrontX = radBackX + T;
  const tubeCenterX = radBackX + T / 2;
  const topScrewY = rTop + OFFSET_35;
  const bottomScrewY = topScrewY + screwSpacing;
  const sRight = radFrontX + 34;
  const sideBottom = floorY + 8;

  const vbW = sRight + M;
  const vbH = Math.max(frontBottom, sideBottom) + M;

  const nOffset = (H - N) / 2;
  const nTop = rTop + nOffset;
  const nBottom = rBottom - nOffset;

  const bracketTop = rTop + 6;
  const bracketHeight = H - 12;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxHeight: '88vh' }}
      fontFamily="sans-serif">
      <defs>
        <marker id="dimArrowEnd" markerUnits="userSpaceOnUse" markerWidth="3.6" markerHeight="3.6"
          refX="3.6" refY="1.8" orient="auto">
          <path d="M0,0 L3.6,1.8 L0,3.6 z" fill={STROKE} />
        </marker>
        <marker id="dimArrowStart" markerUnits="userSpaceOnUse" markerWidth="3.6" markerHeight="3.6"
          refX="0" refY="1.8" orient="auto">
          <path d="M3.6,0 L0,1.8 L3.6,3.6 z" fill={STROKE} />
        </marker>
        <pattern id="wallHatch" patternUnits="userSpaceOnUse" width="5" height="5"
          patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#A6A6A6" strokeWidth={0.6} />
        </pattern>
        <pattern id="floorHatch" patternUnits="userSpaceOnUse" width="5" height="5"
          patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#BFBFBF" strokeWidth={0.5} />
        </pattern>
      </defs>

      {/* ============ FRONT VIEW ============ */}
      {/* floor */}
      <rect x={rLeft - 18} y={floorY} width={frontRight - (rLeft - 18)} height={5} fill="#E6E6E6" />
      <rect x={rLeft - 18} y={floorY} width={frontRight - (rLeft - 18)} height={5} fill="url(#floorHatch)" />
      <line x1={rLeft - 18} y1={floorY} x2={frontRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />

      {/* radiator (server front-view SVG) */}
      {serverSvg ? (
        <svg x={rLeft} y={rTop} width={B} height={H} viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet" overflow="visible">
          <g dangerouslySetInnerHTML={{ __html: inner }} />
        </svg>
      ) : (
        <rect x={rLeft} y={rTop} width={B} height={H} fill={color} stroke={STROKE} strokeWidth={THIN} />
      )}
      {/* radiator outline guide */}
      <rect x={rLeft} y={rTop} width={B} height={H} fill="none" stroke={STROKE} strokeWidth={THIN} />

      {/* KLK brackets */}
      {bracketCenters.map((cx, i) => (
        <FrontBracket key={i} cx={cx} top={bracketTop} height={bracketHeight} width={BRACKET_WIDTH_45} />
      ))}

      {/* B dimension (top) */}
      <DimLine x1={rLeft - OFFSET_12} y1={rTop - 10} x2={rRight + OFFSET_12} y2={rTop - 10}
        label={`B = ${B}`} ext={10} extDir={-1} />

      {/* H dimension (left) */}
      <DimLine x1={rLeft - 10} y1={rTop - OFFSET_35} x2={rLeft - 10} y2={rBottom + OFFSET_35}
        label={`H = ${H}`} ext={10} extDir={-1} />

      {/* N interaxis (right of radiator) */}
      <DimLine x1={rRight + 10} y1={nTop} x2={rRight + 10} y2={nBottom}
        label={`N = ${N}`} ext={8} extDir={1} />

      {/* K bracket spacing (below radiator, above floor) */}
      {bracketCenters.length >= 2 && (
        <DimLine x1={firstBx} y1={rBottom + 5} x2={lastBx} y2={rBottom + 5}
          label={`K = ${K}`} ext={5} extDir={1} />
      )}

      {/* 45 bracket width callout on first bracket */}
      {bracketCenters.length >= 1 && (
        <DimLine x1={firstBx - BRACKET_WIDTH_45 / 2} y1={bracketTop - 5}
          x2={firstBx + BRACKET_WIDTH_45 / 2} y2={bracketTop - 5}
          label="45" ext={5} extDir={-1} />
      )}

      {/* A = T×0.75 floor clearance (right) */}
      <DimLine x1={rRight + 22} y1={rBottom} x2={rRight + 22} y2={floorY}
        label={`A = ${A_FORMULA} = ${A}`} ext={8} extDir={1} />

      {/* ============ SIDE VIEW ============ */}
      {/* wall */}
      <rect x={wallX} y={rTop - 26} width={wallThick} height={floorY - (rTop - 26) + 5} fill="#D1D1D1" />
      <rect x={wallX} y={rTop - 26} width={wallThick} height={floorY - (rTop - 26) + 5} fill="url(#wallHatch)" />
      <line x1={wallRightX} y1={rTop - 26} x2={wallRightX} y2={floorY + 5} stroke={STROKE} strokeWidth={THIN} />

      {/* floor (side) */}
      <rect x={wallX} y={floorY} width={sRight - wallX} height={5} fill="#E6E6E6" />
      <rect x={wallX} y={floorY} width={sRight - wallX} height={5} fill="url(#floorHatch)" />
      <line x1={wallX} y1={floorY} x2={sRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />

      {/* bracket plate (side) */}
      <rect x={radBackX - bracketPlate} y={bracketTop} width={bracketPlate} height={bracketHeight}
        rx={2} fill="#CCCCCC" stroke="#7A7A7A" strokeWidth={0.4} />

      {/* anchor screws */}
      <circle cx={wallRightX} cy={topScrewY} r={1.8} fill="#5A5A5A" />
      <line x1={wallRightX - 3} y1={topScrewY} x2={wallRightX + 3} y2={topScrewY} stroke="#3A3A3A" strokeWidth={0.5} />
      <circle cx={wallRightX} cy={bottomScrewY} r={1.8} fill="#5A5A5A" />
      <line x1={wallRightX - 3} y1={bottomScrewY} x2={wallRightX + 3} y2={bottomScrewY} stroke="#3A3A3A" strokeWidth={0.5} />

      {/* radiator depth profile */}
      <rect x={radBackX} y={rTop} width={T} height={H} fill={color} stroke={STROKE} strokeWidth={THIN} />

      {/* T depth dimension (top) */}
      <DimLine x1={radBackX} y1={rTop - 8} x2={radFrontX} y2={rTop - 8}
        label={`T = ${T}`} ext={8} extDir={-1} />

      {/* 30 mm wall clearance */}
      <DimLine x1={wallRightX} y1={rBottom + 14} x2={radBackX} y2={rBottom + 14}
        label="30 мм" ext={14} extDir={1} />

      {/* D wall-to-tube-center */}
      <DimLine x1={wallRightX} y1={rTop + H / 2} x2={tubeCenterX} y2={rTop + H / 2 - 10}
        label={`D = ${D}`} ext={8} extDir={1} />

      {/* 100 screw spacing */}
      <DimLine x1={radFrontX + 10} y1={topScrewY} x2={radFrontX + 10} y2={bottomScrewY}
        label={`${screwSpacing}`} ext={10} extDir={1} />

      {/* C top-screw-to-floor */}
      <DimLine x1={radFrontX + 22} y1={topScrewY} x2={radFrontX + 22} y2={floorY}
        label={`C = ${C}`} ext={10} extDir={1} />
    </svg>
  );
}