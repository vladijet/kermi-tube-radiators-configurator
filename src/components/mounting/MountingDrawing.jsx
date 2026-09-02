import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { SECTION_LENGTH } from '@/lib/radiatorData';
import { OFFSET_12, OFFSET_35, BRACKET_WIDTH_45, WALL_CLEARANCE_30 } from '@/lib/mountingGeometry';
import { buildSideViewSvg } from '@/lib/sideViewAssembly';
import { FRONT_UP, FRONT_DOWN, SIDE_UP, SIDE_DOWN, frontUpInner, frontDownInner, sideUpInner, sideDownInner } from '@/lib/klkBracketAssets';

// Mounting scheme built ON TOP of the ready server render (renderRadiatorSvg).
// The radiator itself is NOT redrawn — the server SVG is embedded as-is (compact
// mode, no flow arrows) and only dimension lines + side view are drawn around it.

const STROKE = '#5B5B5B';
const THIN = 0.8;
const MED = 1.2;
const FONT = 11;
const DIM = 50; // base offset of a dimension line from the object (~1.8× for clearance)
const EXT = 6;  // extension-line overshoot

// Dimension line: (x1,y1)-(x2,y2) are the measured object edges; the dim line is
// drawn parallel to them, shifted outward by `offset` on `side` ('top'|'bottom'|'left'|'right').
function DimLine({ x1, y1, x2, y2, label, offset, side, tight, tightDir = 'right' }) {
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
    if (tight) {
      // Tight-space rule: drop the inner arrow, extend the line outward as a
      // leader, draw an explicit triangle whose point sits on the leader end
      // and faces inward toward the dimension span, place the value above.
      const leader = FONT * 1.6;
      const HLEN = 11, HW = 2.25;
      const labelY = dimY + (side === 'top' ? -FONT * 0.7 : FONT * 0.7);
      let line, arrow;
      if (tightDir === 'left') {
        const startX = x1 - leader;
        labelEl = (
          <text x={(x1 + startX) / 2} y={labelY} fontSize={FONT} fill={STROKE} textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">{label}</text>
        );
        line = <line x1={startX} y1={dimY} x2={x2} y2={dimY} stroke={STROKE} strokeWidth={MED} />;
        // tip at x1 (measured boundary) pointing right (inward)
        arrow = <polygon points={`${x1},${dimY} ${x1 - HLEN},${dimY - HW} ${x1 - HLEN},${dimY + HW}`} fill={STROKE} />;
      } else {
        const endX = x2 + leader;
        labelEl = (
          <text x={(x2 + endX) / 2} y={labelY} fontSize={FONT} fill={STROKE} textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">{label}</text>
        );
        line = <line x1={x1} y1={dimY} x2={endX} y2={dimY} stroke={STROKE} strokeWidth={MED} />;
        // tip at x2 (measured boundary) pointing left (inward)
        arrow = <polygon points={`${x2},${dimY} ${x2 + HLEN},${dimY - HW} ${x2 + HLEN},${dimY + HW}`} fill={STROKE} />;
      }
      dim = <>{line}{arrow}</>;
    } else {
      const labelY = dimY + (side === 'top' ? -FONT * 0.7 : FONT * 0.7);
      labelEl = (
        <text x={(x1 + x2) / 2} y={labelY} fontSize={FONT} fill={STROKE} textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif">{label}</text>
      );
      dim = <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke={STROKE} strokeWidth={MED} markerStart="url(#dimArrowStart)" markerEnd="url(#dimArrowEnd)" />;
    }
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
    const labelX = dimX + (side === 'left' ? -FONT * 0.7 : FONT * 0.7);
    labelEl = (
      <text x={labelX} y={my} fontSize={FONT} fill={STROKE} textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif" transform={`rotate(-90 ${labelX} ${my})`}>{label}</text>
    );
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

export default function MountingDrawing({ dims, sections, height, connectionCode, valveType, color, ventType, drainValve, series }) {
  const { H, B, T, N, K, A, C, D, bracketPositions, screwSpacing } = dims;
  const [inner, setInner] = useState('');
  const [viewBox, setViewBox] = useState('');
  const [loading, setLoading] = useState(true);

  // Side-view radiator body: assembled synchronously from the official layer rules,
  // recoloured to the selected RAL colour, with connection hardware. No loading delay.
  const sideView = useMemo(() => {
    const tubes = Math.round((T - 25) / 40) + 1;
    return buildSideViewSvg({
      tubes,
      height: H,
      color: color || '#F4F4F4',
      connectionCode: connectionCode || 'N12',
      valveType: valveType || '',
      ventSide: computeVentSide(connectionCode, valveType),
      ventType: ventType || '',
      drainValve: drainValve || false,
      series: series || '',
    });
  }, [T, H, color, connectionCode, valveType, ventType, drainValve, series]);

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
          hideArrows: false,
          interaxisTop: (H - N) / 2,
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
  }, [sections, height, connectionCode, valveType, color, ventType, drainValve, N]);

  if (!H || !B) return null;
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
        <div className="text-[14px] font-semibold text-neutral-500 uppercase tracking-wide">Загрузка схемы монтажа</div>
      </div>
    );
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
  const bw = BRACKET_WIDTH_45 * scale;
  const fuW = FRONT_UP.w * scale, fuH = FRONT_UP.h * scale;
  const fdW = FRONT_DOWN.w * scale, fdH = FRONT_DOWN.h * scale;
  const fuTop = bodyTopY + (55 - 13.664) * scale;  // upper bracket top so its top screw hole is 55 mm below radiator top
  const fuHoleY = bodyTopY + 55 * scale;            // upper bracket top screw hole centre
  const fdBottom = bodyBottomY - 100 * scale;       // lower support 100 mm above radiator bottom

  const nOff = (H - N) / 2;
  const nTop = bodyTopY + nOff * scale;
  const nBottom = bodyBottomY - nOff * scale;

  // side view — wall on the RIGHT, radiator front faces left
  const sLeft = bodyRightX + DIM * 2.6 + 28;
  const wallThick = 14;
  const radFrontX = sLeft;
  const radBackX = radFrontX + T * scale;
  const wallLeftX = radBackX + WALL_CLEARANCE_30 * scale;
  const wallX = wallLeftX;
  const wallRightX = wallLeftX + wallThick;
  const tubeCenterX = radFrontX + (T / 2) * scale;
  const topScrewY = bodyTopY + OFFSET_35 * scale;
  const bottomScrewY = topScrewY + screwSpacing * scale;
  const sRight = wallRightX + DIM * 2.6 + 10;

  const kY = floorY + DIM * 0.9;
  const vbW = sRight + M;
  const vbH = Math.max(kY, floorY + DIM * 0.7) + FONT + M;

  const fLeft = bodyLeftX - 24;
  const fRight = bodyRightX + 24;
  const sFloorRight = sRight;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" style={{ maxHeight: '86vh' }} fontFamily="sans-serif">
      <defs>
        <marker id="dimArrowEnd" markerUnits="userSpaceOnUse" markerWidth={11} markerHeight={4.5} refX={22.5381} refY={4.40682} orient="auto" viewBox="0 0 23 9">
          <path d="M22.5381 4.40682 L0 -0.000615151 L0 8.81426 Z" fill={STROKE} />
        </marker>
        <marker id="dimArrowStart" markerUnits="userSpaceOnUse" markerWidth={11} markerHeight={4.5} refX={0} refY={4.40682} orient="auto" viewBox="0 0 23 9">
          <path d="M-2.22459e-07 4.40682 L22.5381 -0.000615151 L22.5381 8.81426 Z" fill={STROKE} />
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

      {/* ===== KLK brackets — official assets (front view) ===== */}
      {bracketCenters.map((cx, i) => (
        <g key={`b${i}`}>
          <svg x={cx - fuW / 2} y={fuTop} width={fuW} height={fuH} viewBox={`0 0 ${FRONT_UP.w} ${FRONT_UP.h}`} preserveAspectRatio="none"
            dangerouslySetInnerHTML={{ __html: frontUpInner(i) }} />
          <svg x={cx - 10 * scale} y={fdBottom - fdH} width={fdW} height={fdH} viewBox={`0 0 ${FRONT_DOWN.w} ${FRONT_DOWN.h}`} preserveAspectRatio="none"
            dangerouslySetInnerHTML={{ __html: frontDownInner(i) }} />
        </g>
      ))}

      {/* ===== front-view dimensions ===== */}
      {/* Top: three stacked dimension levels (outermost → innermost) */}
      {/* Level 1 (outermost): total width = body + both end caps */}
      <DimLine x1={bodyLeftX - OFFSET_12 * scale} y1={bodyTopY} x2={bodyRightX + OFFSET_12 * scale} y2={bodyTopY} label={`${B + 2 * OFFSET_12}`} offset={DIM} side="top" />
      {/* Level 2 (middle): left end cap + body width + right end cap */}
      <DimLine x1={bodyLeftX - OFFSET_12 * scale} y1={bodyTopY} x2={bodyLeftX} y2={bodyTopY} label="12" offset={DIM * 0.7} side="top" tight tightDir="left" />
      <DimLine x1={bodyLeftX} y1={bodyTopY} x2={bodyRightX} y2={bodyTopY} label={`${B}`} offset={DIM * 0.7} side="top" />
      <DimLine x1={bodyRightX} y1={bodyTopY} x2={bodyRightX + OFFSET_12 * scale} y2={bodyTopY} label="12" offset={DIM * 0.7} side="top" tight />
      {/* Level 3 (innermost): K bracket spacing */}
      {bracketCenters.length >= 2 && (
        <DimLine x1={firstBx} y1={bodyTopY} x2={lastBx} y2={bodyTopY} label={`${K}`} offset={DIM * 0.45} side="top" />
      )}
      {/* Left outer: H (body height) */}
      <DimLine x1={bodyLeftX} y1={bodyTopY} x2={bodyLeftX} y2={bodyBottomY} label={`${H}`} offset={DIM * 1.9} side="left" />
      {/* Left: N (interaxis) closer to radiator */}
      <DimLine x1={bodyLeftX} y1={nTop} x2={bodyLeftX} y2={nBottom} label={`${N}`} offset={DIM} side="left" />
      {/* Left outer: A (floor clearance) */}
      <DimLine x1={bodyLeftX} y1={bodyBottomY} x2={bodyLeftX} y2={floorY} label={`${A}`} offset={DIM * 1.9} side="left" />
      {/* Bracket details unchanged */}
      {bracketCenters.length >= 1 && (
        <DimLine x1={firstBx - bw / 2} y1={fuTop} x2={firstBx + bw / 2} y2={fuTop} label="45" offset={DIM * 0.5} side="top" />
      )}
      {bracketCenters.length >= 1 && (
        <DimLine x1={firstBx} y1={bodyTopY} x2={firstBx} y2={fuHoleY} label="55" offset={DIM * 0.55} side="left" />
      )}

      {/* ===== side view ===== */}
      <rect x={wallX} y={bodyTopY - 26} width={wallThick} height={floorY - (bodyTopY - 26) + 6} fill="#d1d1d1" />
      <rect x={wallX} y={bodyTopY - 26} width={wallThick} height={floorY - (bodyTopY - 26) + 6} fill="url(#wallHatch)" />
      <line x1={wallX} y1={bodyTopY - 26} x2={wallX} y2={floorY + 6} stroke={STROKE} strokeWidth={THIN} />
      <rect x={sLeft} y={floorY} width={sFloorRight - sLeft} height={5} fill="#e6e6e6" />
      <rect x={sLeft} y={floorY} width={sFloorRight - sLeft} height={5} fill="url(#floorHatch)" />
      <line x1={sLeft} y1={floorY} x2={sFloorRight} y2={floorY} stroke={STROKE} strokeWidth={THIN} />
      <svg x={radFrontX - sideView.padL * scale} y={bodyTopY - sideView.padT * scale}
        width={(sideView.padL + T + sideView.padR) * scale} height={(sideView.padT + H + sideView.padB) * scale}
        viewBox={sideView.viewBox} preserveAspectRatio="xMidYMid meet"
        dangerouslySetInnerHTML={{ __html: sideView.inner }} />
      {/* ===== KLK brackets — official assets (side view, mirrored, wall on the right) ===== */}
      <svg x={wallLeftX - 57.5 * scale} y={fuTop} width={SIDE_UP.w * scale} height={SIDE_UP.h * scale} viewBox={`0 0 ${SIDE_UP.w} ${SIDE_UP.h}`} preserveAspectRatio="none"
        dangerouslySetInnerHTML={{ __html: sideUpInner(0) }} />
      <svg x={wallLeftX - SIDE_DOWN.w * scale} y={fdBottom - SIDE_DOWN.h * scale} width={SIDE_DOWN.w * scale} height={SIDE_DOWN.h * scale} viewBox={`0 0 ${SIDE_DOWN.w} ${SIDE_DOWN.h}`} preserveAspectRatio="none"
        dangerouslySetInnerHTML={{ __html: sideDownInner(0) }} />

      {/* ===== side-view dimensions (aligned with front-view top levels) ===== */}
      {/* Level 1 (outermost): total wall-to-radiator-edge, aligned with front 834 */}
      <DimLine x1={radFrontX} y1={bodyTopY} x2={wallLeftX} y2={bodyTopY} label={`${T + WALL_CLEARANCE_30}`} offset={DIM} side="top" />
      {/* Level 2 (middle): depth + wall gap, aligned with front 810 */}
      <DimLine x1={radFrontX} y1={bodyTopY} x2={radBackX} y2={bodyTopY} label={`${T}`} offset={DIM * 0.7} side="top" />
      <DimLine x1={radBackX} y1={bodyTopY} x2={wallLeftX} y2={bodyTopY} label="30" offset={DIM * 0.7} side="top" tight />
      <DimLine x1={tubeCenterX} y1={bodyBottomY} x2={wallLeftX} y2={bodyBottomY} label={`${D}`} offset={DIM * 0.5} side="bottom" />
      <DimLine x1={wallLeftX} y1={fuHoleY} x2={wallLeftX} y2={fuHoleY + screwSpacing * scale} label={`${screwSpacing}`} offset={DIM} side="right" />
      <DimLine x1={wallLeftX} y1={fuHoleY} x2={wallLeftX} y2={floorY} label={`${C}`} offset={DIM * 2.3} side="right" />
    </svg>
  );
}