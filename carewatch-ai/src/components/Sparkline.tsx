import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 100,
  height = 30,
  strokeWidth = 2,
}) => {
  if (!data || data.length === 0) {
    return <View style={{ width, height }} />;
  }
  if (data.length === 1) {
    // If only one data point, just draw a horizontal line
    return (
      <Svg width={width} height={height}>
        <Polyline
          points={`0,${height / 2} ${width},${height / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min; // avoid division by zero

  // Add 10% padding top and bottom
  const paddingY = height * 0.1;
  const usableHeight = height - paddingY * 2;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const normalized = (val - min) / range;
      const y = paddingY + (usableHeight - normalized * usableHeight);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
