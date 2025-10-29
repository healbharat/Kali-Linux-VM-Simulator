import React from 'react';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 200,
  height = 50,
  color = 'var(--color-accent)',
}) => {
  if (data.length < 2) {
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="bg-black/30 rounded-md border border-yellow-700 flex items-center justify-center">
        <text x={width / 2} y={height / 2} fill="var(--color-text-secondary)" textAnchor="middle" fontSize="10">
          Waiting for data...
        </text>
      </svg>
    );
  }

  const maxVal = Math.max(...data, 1); // Avoid division by zero
  const range = maxVal; // Assume graph starts at 0

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="bg-black/30 rounded-md border border-yellow-700">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1"
        points={points}
      />
    </svg>
  );
};

export default LineChart;
