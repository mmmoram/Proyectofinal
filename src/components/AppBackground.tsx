import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Pattern, Line } from 'react-native-svg';

export default function AppBackground() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          {/* Gradiente diagonal: lavanda → azul cielo suave */}
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0"    stopColor="#EDE9FE" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#EEF2FF" stopOpacity="1" />
            <Stop offset="1"    stopColor="#E0F2FE" stopOpacity="1" />
          </LinearGradient>

          {/* Cuadrícula: líneas cada 28 px con opacidad muy baja */}
          <Pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <Line
              x1="28" y1="0" x2="28" y2="28"
              stroke="#6366F1" strokeWidth="0.5" strokeOpacity="0.18"
            />
            <Line
              x1="0" y1="28" x2="28" y2="28"
              stroke="#6366F1" strokeWidth="0.5" strokeOpacity="0.18"
            />
          </Pattern>
        </Defs>

        {/* Fondo con gradiente */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#bgGrad)" />

        {/* Cuadrícula encima */}
        <Rect x="0" y="0" width={width} height={height} fill="url(#grid)" />
      </Svg>
    </View>
  );
}
