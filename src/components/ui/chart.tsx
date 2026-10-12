import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Circle } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { Area, Bar, CartesianChart, Line, useChartPressState as useVictoryChartPressState } from 'victory-native';

// Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
}

export interface ChartContainerProps extends ViewProps {
  children: React.ReactNode;
}

export interface ChartProps {
  data: Array<ChartDataPoint>;
  color?: string;
  height?: number;
  showGrid?: boolean;
  animated?: boolean;
  onPointPress?: (point: ChartDataPoint) => void;
}

// Theme colors mapping
const useChartTheme = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    primary: '#f0b100',
    secondary: '#4f39f6',
    muted: isDark ? '#24273c' : '#f5f5f5',
    mutedForeground: isDark ? '#c7cce8' : '#737373',
    border: isDark ? '#33353e' : '#e5e5e5',
    background: isDark ? '#101117' : '#ffffff',
    foreground: isDark ? '#cacddc' : '#0a0a0a',
    grid: isDark ? 'rgba(99, 107, 174, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  };
};

// Chart Container Component
export function ChartContainer({ children, className, ...props }: ChartContainerProps) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}

// Tooltip Component
interface TooltipProps {
  x: number;
  y: number;
  color: string;
}

function ChartTooltip({ x, y, color }: TooltipProps) {
  return <Circle cx={x} cy={y} r={6} color={color} opacity={0.8} />;
}

// Line Chart Component
export function ChartLine({
  data,
  color,
  height = 250,
  showGrid = true,
  animated = true,
  onPointPress,
}: ChartProps) {
  const theme = useChartTheme();
  const chartColor = color || theme.primary;
  const { state, isActive } = useChartPressState();
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(null);

  // Validate data
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-muted-foreground">No data available</Text>
      </View>
    );
  }

  const formattedData = data.map((point, index) => ({
    x: typeof point.x === 'number' ? point.x : index,
    y: point.y,
    label: point.x.toString(),
  }));

  return (
    <View style={{ height }}>
      <CartesianChart
        data={formattedData}
        xKey="x"
        yKeys={['y']}
        axisOptions={{
          font: undefined,
          tickCount: 5,
          labelColor: theme.mutedForeground,
          lineColor: showGrid ? theme.grid : 'transparent',
          formatXLabel: (value) => {
            const point = data[Math.floor(value)];
            return point ? point.x.toString() : '';
          },
        }}
        chartPressState={state}
      >
        {({ points, chartBounds }) => (
          <>
            <Line
              points={points.y}
              color={chartColor}
              strokeWidth={3}
              animate={{ type: 'timing', duration: animated ? 800 : 0 }}
              curveType="natural"
            />
            {isActive && (
              <ChartTooltip
                x={state.x.position.value}
                y={state.y.y.position.value}
                color={chartColor}
              />
            )}
          </>
        )}
      </CartesianChart>
      {activePoint && (
        <View style={styles.tooltipContainer}>
          <Text className="text-sm text-foreground font-semibold">
            {activePoint.x}: {activePoint.y}
          </Text>
        </View>
      )}
    </View>
  );
}

// Bar Chart Component
export function ChartBar({
  data,
  color,
  height = 250,
  showGrid = true,
  animated = true,
  onPointPress,
}: ChartProps) {
  const theme = useChartTheme();
  const chartColor = color || theme.primary;
  const { state, isActive } = useChartPressState();

  // Validate data
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-muted-foreground">No data available</Text>
      </View>
    );
  }

  const formattedData = data.map((point, index) => ({
    x: typeof point.x === 'number' ? point.x : index,
    y: point.y,
    label: point.x.toString(),
  }));

  return (
    <View style={{ height }}>
      <CartesianChart
        data={formattedData}
        xKey="x"
        yKeys={['y']}
        axisOptions={{
          font: undefined,
          tickCount: 5,
          labelColor: theme.mutedForeground,
          lineColor: showGrid ? theme.grid : 'transparent',
          formatXLabel: (value) => {
            const point = data[Math.floor(value)];
            return point ? point.x.toString() : '';
          },
        }}
        chartPressState={state}
      >
        {({ points, chartBounds }) => (
          <>
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              color={chartColor}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              animate={{ type: 'timing', duration: animated ? 800 : 0 }}
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}

// Area Chart Component
export function ChartArea({
  data,
  color,
  height = 250,
  showGrid = true,
  animated = true,
  onPointPress,
}: ChartProps) {
  const theme = useChartTheme();
  const chartColor = color || theme.primary;
  const { state, isActive } = useChartPressState();

  // Validate data
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-muted-foreground">No data available</Text>
      </View>
    );
  }

  const formattedData = data.map((point, index) => ({
    x: typeof point.x === 'number' ? point.x : index,
    y: point.y,
    label: point.x.toString(),
  }));

  return (
    <View style={{ height }}>
      <CartesianChart
        data={formattedData}
        xKey="x"
        yKeys={['y']}
        axisOptions={{
          font: undefined,
          tickCount: 5,
          labelColor: theme.mutedForeground,
          lineColor: showGrid ? theme.grid : 'transparent',
          formatXLabel: (value) => {
            const point = data[Math.floor(value)];
            return point ? point.x.toString() : '';
          },
        }}
        chartPressState={state}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.y}
              y0={chartBounds.bottom}
              color={chartColor}
              opacity={0.2}
              animate={{ type: 'timing', duration: animated ? 800 : 0 }}
              curveType="natural"
            />
            <Line
              points={points.y}
              color={chartColor}
              strokeWidth={3}
              animate={{ type: 'timing', duration: animated ? 800 : 0 }}
              curveType="natural"
            />
            {isActive && (
              <ChartTooltip
                x={state.x.position.value}
                y={state.y.y.position.value}
                color={chartColor}
              />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

// Helper hook for chart press state
function useChartPressState() {
  return useVictoryChartPressState({ x: 0, y: { y: 0 } });
}

const styles = StyleSheet.create({
  tooltipContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
