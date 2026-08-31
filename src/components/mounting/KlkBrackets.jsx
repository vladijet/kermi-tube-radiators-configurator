import React from 'react';

// Simplified KLK bracket representation (vertical mounting plate with two screw holes).
// Drawn in the parent SVG's millimetre coordinate space.
export function FrontBracket({ cx, top, height, width = 45 }) {
  const x = cx - width / 2;
  return (
    <g>
      <rect
        x={x} y={top} width={width} height={height} rx={3}
        fill="#CCCCCC" stroke="#7A7A7A" strokeWidth={0.4}
      />
      <rect x={x} y={top} width={width} height={height * 0.18} fill="#B5B5B5" />
      <rect x={x} y={top + height * 0.82} width={width} height={height * 0.18} fill="#B5B5B5" />
      <circle cx={cx} cy={top + 7} r={2} fill="#5A5A5A" />
      <circle cx={cx} cy={top + height - 7} r={2} fill="#5A5A5A" />
    </g>
  );
}

export default FrontBracket;