import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { SECTION_LENGTH } from '@/lib/radiatorData';
import { OFFSET_35, BRACKET_WIDTH_45, WALL_CLEARANCE_30 } from '@/lib/mountingGeometry';

// Mounting scheme built ON TOP of the ready server render (renderRadiatorSvg).
// The radiator itself is NOT redrawn — the server SVG is embedded as-is (compact
// mode, no flow arrows) and only dimension lines + side view are drawn around it.

const STROKE = '#374151';
const THIN = 0.8;
const MED = 1.2;
const FONT = 11;
const DIM = 18; // base offset of a dimension line from the object
const EXT = 6;  // extension-line overshoot

// Dimension line: (x1,y1)-(x2,y2) are the measured object edges; the dim line is
// drawn parallel to them, shifted outward by `offset` on `side` ('top'|'bottom'|'left'|'right').
function DimLine({ x1, y1, x2, y2, label, offset, side }) {
  const horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  let exts, dim, labelEl;
  if (horiz) {
    const dy = side === 'top' ? -offset : offset;
    const dimY = y1 + dy;
    const over = side === 'top' ? -EXT : EXT;
    exts = (
      <>
        <line x1={x1} y1={y1} x2={x1} y2={dimY + over} stroke={STROKE} strokeWidth={THIN} />
        <line x1={x2} y1={y2} x2={x2} y2={dimY + over} stroke={STROKE} strokeWidth={THIN} />
      </>
    );
    const ly = side === 'top' ? dimY - 2 : dimY + FONT + 1;
    labelEl = <text x={(x1 + x2) / 2} y={ly} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif">{label}</text>;
    dim = <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke={STROKE} strokeWidth={MED} markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />;
  } else {
    const dx = side === 'left' ? -offset : offset;
    const dimX = x1 + dx;
    const over = side === 'left' ? -EXT : EXT;
    exts = (
      <>
        <line x1={x1} y1={y1} x2={dimX + over} y2={y1} stroke={STROKE} strokeWidth={THIN} />
        <line x1={x2} y1={y2} x2={dimX + over} y2={y2} stroke={STROKE} strokeWidth={THIN} />
      </>
    );
    const my = (y1 + y2) / 2;
    const lx = side === 'left' ? dimX - 2 : dimX + 2;
    labelEl = <text x={lx} y={my} fontSize={FONT} fill={STROKE} textAnchor="middle" fontFamily="sans-serif" transform={`rotate(-90 ${lx} ${my})`}>{label}</text>;
    dim = <line x1={dimX} y1={y1} x2={dimX} y2={y2} stroke={STROKE} strokeWidth={MED} markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />;
  }
  return <g>{exts}{dim}{labelEl}</g>;
}

function parseServerSvg(svgStr) {
  const vbMatch = svgStr.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 100 100';
  const innerMatch = svgStr.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const inner = innerMatch ? innerMatch[1] : '';
  return { viewBox, inner };
}

function computeVentSide(connectionCode, valveType) {
  const num = (connectionCode || '').replace(/\D/g, '');
  if (['69', '89', '96', '98'].includes(num)) {
    const vt = valveType || '';
    if (num === '69') return vt === 'ТВН' ? 'both' : 'right';
    if (num === '89') return vt === 'ТВН' ? 'both' : 'left';
    if (num === '96') return 'left';
    if (num === '98') return 'right';
    return '';
  }
  return ['12', '14', '68'].includes(num) ? 'right' : 'left';
}

export default function MountingDrawing({ dims, sections, height, connectionCode, valveType, color, ventType, drainValve }) {
  const { H, B, T, N, K, A, C, D, bracketPositions, screwSpacing } = dims;
  const [inner, setInner] = useState('');
  const [viewBox, setViewBox] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke('renderRadiatorSvg', {
          sections: Number(sections) || 9,
          height: Number(height) || 600,
          connectionCode: connectionCode || 'N12',
          valveType: valveType || '',
          color: color || '#F4F4F4',
          ventSide: computeVentSide(connectionCode, valveType),
          ventType: ventType || '',
          drainValve: drainValve || false,
          hideArrows: true,
        });
        if (!cancelled) {
          const { viewBox: vb, inner: html } = parseServerSvg(res.data?.svg || '');
          setViewBox(vb);
          setInner(html);
          setLoading(false);
        }
      } catch (_e) {
        if (!cancelled) { setInner(''); setLoading(false); }
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(id); };
  }, [sections, height, connectionCode, valveType, color, ventType, drainValve]);

  if (!H || !B) return null;
  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" /></div>;
  }
  if (!inner || !viewBox) {
    return <div className="text-neutral-400 text-sm text-center py-20">Рендер недоступен</div>;
  }

  const [vMinX, , vW, vH] = viewBox.split(/\s+/).map(Number);
  const pad = Math.max(-vMinX, 0); // symmetric internal padding of the server viewBox
  const totalW = vW - 2 * pad;
  const scale = Math.min(460 / H, 600 / Math.max(totalW, 1));
  const boxW = vW * scale;
  const boxH = vH * scale;
  const M = 26;
  const boxX = M + DIM + 10;
  const boxY = M + DIM + 10;
  const bodyLeftX = boxX + pad * scale;
  const bodyTopY = boxY + pad * scale;
  const bodyW = totalW * scale;
  const bodyH = H * scale;
  const bodyRightX = bodyLeftX + bodyW;
  const bodyBottomY = bodyTopY + bodyH;
  const floorY = bodyBottomY + A * scale;

  const bracketCenters = bracketPositions.map((p) => bodyLeftX + (p - 0.5) * SECTION_LENGTH * scale);
  const firstBx = bracketCenters[0];
  const lastBx = bracketCenters[bracketCenters.length - 1];
  const bracketTop = bodyTopY + 6 * scale;
  const bracketH = bodyH - 12 * scale;
  const bw = BRACKET_WIDTH_45 * scale;

  const nOff = (H - N) / 2;
  const nTop = bodyTopY + nOff * scale;
  const nBottom = bodyBottomY - nOff * scale;

  // side view
  const sLeft = bodyRightX + DIM * 2.6 + 28;
  const wallThick = 14;
  const wallX = sLeft;
  const wallRightX = wallX + wallThick;
  const radBackX = wallRightX + WALL_CLEARANCE_30 * scale;
  const radFrontX = radBackX + T * scale;
  const tubeCenterX = radBackX + (T / 2) * scale;
  const topScrewY = bodyTopY + OFFSET_35 * scale;
  const bottomScrewY = topScrewY + screwSpacing * scale;
  const sRight = radFrontX + DIM * 2.6 + 10;

  const kY = floorY + DIM * 0.9;
  const vbW = sRight + M;
  const vbH = Math.max(kY, floorY + DIM * 0.7) + FONT + M;

  const fLeft = bodyLeftX - 24;
  const fRight = bodyRightX + 24;
  const sFloorRight = sRight;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxHeight: '86vh' }} fontFamily="sans-serif">
      <defs>
        <marker id="dimArrowEnd" markerUnits="userSpaceOnUse" markerWidth={9} markerHeight={9} refX={4.5} refY={4.5} orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={STROKE} />
        </marker>
        <marker id="dimArrowStart" markerUnits="userSpaceOnUse" markerWidth={9} markerHeight={9} refX={4.5} refY={4.5} orient="auto">
          <path d="M9,0 L0,4.5 L9,9 z" fill={STROKE} />
        </marker>
        <pattern id="wallHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={6} stroke="#9ca3af" strokeWidth={0.9} />
        </pattern>
        <pattern id="floorHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2={6} stroke="#bfbfbf" strokeWidth={0.8} />
        </pattern>
      </defs>

      {/* ===== ready server render of the radiator ===== */}
      <svg x={boxX} y={boxY} width={boxW} height={boxH} viewBox={viewBox} preserveAspectRatio="xMidYMid meet"
        dangerouslySetInnerHTML={{ __html: inner }} />

      {/* ===== front-view floor ===== */}
      <rect x={fLeft} y={floorY} width={fRight - fLeft} height={5} fill="#e6e6e6" />
      <rect x={fLeft} y={floorY} width={fRight - fLeft} height={5} fill="url(#floorHatch)" />
      <line x1={fLeft} y1={floorY} x2={fRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />

      {/* ===== KLK brackets (overlay on the server render) ===== */}
      {bracketCenters.map((cx, i) => (
        <g key={`b${i}`}>
          <rect x={cx - bw / 2} y={bracketTop} width={bw} height={bracketH} rx={3} fill="#c0c4cc" stroke="#7a7a7a" strokeWidth={THIN} />
          <rect x={cx - bw / 2} y={bracketTop} width={bw} height={bracketH * 0.13} fill="#a8acb3" />
          <rect x={cx - bw / 2} y={bracketTop + bracketH * 0.87} width={bw} height={bracketH * 0.13} fill="#a8acb3" />
          <circle cx={cx} cy={bracketTop + bracketH * 0.12} r={2.2} fill="#555" />
          <circle cx={cx} cy={bracketTop + bracketH * 0.88} r={2.2} fill="#555" />
        </g>
      ))}

      {/* ===== front-view dimensions ===== */}
      <DimLine x1={bodyLeftX} y1={bodyTopY} x2={bodyRightX} y2={bodyTopY} label={`B = ${B}`} offset={DIM} side="top" />
      <DimLine x1={bodyLeftX} y1={bodyTopY} x2={bodyLeftX} y2={bodyBottomY} label={`H = ${H}`} offset={DIM} side="left" />
      <DimLine x1={bodyRightX} y1={nTop} x2={bodyRightX} y2={nBottom} label={`N = ${N}`} offset={DIM} side="right" />
      <DimLine x1={bodyRightX} y1={bodyBottomY} x2={bodyRightX} y2={floorY} label={`A = ${A}`} offset={DIM * 2.1} side="right" />
      {bracketCenters.length >= 2 && (
        <DimLine x1={firstBx} y1={kY} x2={lastBx} y2={kY} label={`K = ${K}`} offset={DIM * 0.9} side="bottom" />
      )}
      {bracketCenters.length >= 1 && (
        <DimLine x1={firstBx - bw / 2} y1={bracketTop} x2={firstBx + bw / 2} y2={bracketTop} label="45" offset={DIM * 0.5} side="top" />
      )}

      {/* ===== side view ===== */}
      <rect x={wallX} y={bodyTopY - 26} width={wallThick} height={floorY - (bodyTopY - 26) + 6} fill="#d1d1d1" />
      <rect x={wallX} y={bodyTopY - 26} width={wallThick} height={floorY - (bodyTopY - 26) + 6} fill="url(#wallHatch)" />
      <line x1={wallRightX} y1={bodyTopY - 26} x2={wallRightX} y2={floorY + 6} stroke={STROKE} strokeWidth={THIN} />
      <rect x={wallX} y={floorY} width={sFloorRight - wallX} height={5} fill="#e6e6e6" />
      <rect x={wallX} y={floorY} width={sFloorRight - wallX} height={5} fill="url(#floorHatch)" />
      <line x1={wallX} y1={floorY} x2={sFloorRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />
      <rect x={wallRightX} y={bracketTop} width={10 * scale} height={bracketH} rx={2} fill="#c0c4cc" stroke="#7a7a7a" strokeWidth={THIN} />
      <circle cx={wallRightX} cy={topScrewY} r={2.4} fill="#555" />
      <line x1={wallRightX - 4} y1={topScrewY} x2={wallRightX + 4} y2={topScrewY} stroke="#333" strokeWidth={0.8} />
      <circle cx={wallRightX} cy={bottomScrewY} r={2.4} fill="#555" />
      <line x1={wallRightX - 4} y1={bottomScrewY} x2={wallRightX + 4} y2={bottomScrewY} stroke="#333" strokeWidth={0.8} />
      <rect x={radBackX} y={bodyTopY} width={T * scale} height={bodyH} fill={color || '#F4F4F4'} stroke="#9ca3af" strokeWidth={THIN} />

      {/* ===== side-view dimensions ===== */}
      <DimLine x1={radBackX} y1={bodyTopY} x2={radFrontX} y2={bodyTopY} label={`T = ${T}`} offset={DIM * 0.7} side="top" />
      <DimLine x1={wallRightX} y1={bodyTopY} x2={tubeCenterX} y2={bodyTopY} label={`D = ${D}`} offset={DIM * 1.9} side="top" />
      <DimLine x1={wallRightX} y1={floorY} x2={radBackX} y2={floorY} label="30" offset={DIM * 0.7} side="bottom" />
      <DimLine x1={radFrontX} y1={topScrewY} x2={radFrontX} y2={bottomScrewY} label={`${screwSpacing}`} offset={DIM} side="right" />
      <DimLine x1={radFrontX} y1={topScrewY} x2={radFrontX} y2={floorY} label={`C = ${C}`} offset={DIM * 2.3} side="right" />
    </svg>
  );
}