import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Polygon, Circle, Line } from 'react-native-svg';
import { colors } from '../theme/colors';

interface BaselineChartProps {
  data: number[];
  mean: number;
  stddev: number;
  width?: number;
  height?: number;
}

export const BaselineChart: React.FC<BaselineChartProps> = ({
  data,
  mean,
  stddev,
  width = Dimensions.get('window').width - 40 - 32, // container padding
  height = 180,
}) => {
  if (!data || data.length === 0) {
    return <View style={{ width, height, backgroundColor: '#f0f0f0' }} />;
  }

  // Calculate scales
  const minData = Math.min(...data);
  const maxData = Math.max(...data);
  
  const bandTopValue = mean + stddev;
  const bandBottomValue = Math.max(0, mean - stddev);
  
  const overallMax = Math.max(maxData, bandTopValue) * 1.1; // 10% headroom
  const overallMin = Math.max(0, Math.min(minData, bandBottomValue) * 0.9); // 10% floor room
  const range = overallMax - overallMin === 0 ? 1 : overallMax - overallMin;

  const paddingY = 20;
  const usableHeight = height - paddingY * 2;

  const mapY = (val: number) => {
    const normalized = (val - overallMin) / range;
    return paddingY + usableHeight - normalized * usableHeight;
  };

  const mapX = (index: number) => {
    return (index / (data.length - 1)) * width;
  };

  // Create Polygon points for the shaded band
  const yBandTop = mapY(bandTopValue);
  const yBandBottom = mapY(bandBottomValue);
  const bandPoints = `0,${yBandTop} ${width},${yBandTop} ${width},${yBandBottom} 0,${yBandBottom}`;

  // Create Polyline points for the actual data
  const linePoints = data.map((val, i) => `${mapX(i)},${mapY(val)}`).join(' ');

  const lastX = mapX(data.length - 1);
  const lastY = mapY(data[data.length - 1]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Shaded Normal Range Band */}
        <Polygon points={bandPoints} fill={colors.primaryLight} opacity={0.5} />
        
        {/* Mean reference line */}
        <Line 
          x1="0" 
          y1={mapY(mean)} 
          x2={width} 
          y2={mapY(mean)} 
          stroke={colors.primary} 
          strokeWidth="1" 
          strokeDasharray="4, 4" 
          opacity={0.4} 
        />

        {/* Data Line */}
        <Polyline
          points={linePoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Highlighted Dot for Today */}
        <Circle cx={lastX} cy={lastY} r={6} fill={colors.white} stroke={colors.primary} strokeWidth={3} />
      </Svg>
    </View>
  );
};
