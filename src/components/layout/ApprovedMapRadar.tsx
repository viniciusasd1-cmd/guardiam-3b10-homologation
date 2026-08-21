import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';

export interface ApprovedMapRadarProps {
  isDark?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ApprovedMapRadar: React.FC<ApprovedMapRadarProps> = ({
  isDark = false,
  height = 160,
  style,
  testID = 'guardiam-map-radar',
}) => {
  return (
    <View
      style={[
        styles.container,
        { height },
        isDark ? styles.darkContainer : styles.lightContainer,
        style,
      ]}
      testID={testID}
    >
      {/* Stylized Vector Map Grid Lines */}
      <Svg
        height="100%"
        width="100%"
        style={styles.svgAbsolute}
      >
        <Defs>
          <Pattern
            id={isDark ? 'grid-dark-native' : 'grid-light-native'}
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke={isDark ? '#1E2D5A' : '#CFE2FE'}
              strokeWidth="1.5"
            />
          </Pattern>
        </Defs>

        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#${isDark ? 'grid-dark-native' : 'grid-light-native'})`}
        />

        {/* Diagonal Arterial Roads */}
        <Path
          d="M -20 40 L 400 180"
          stroke={isDark ? '#233876' : '#BFDBFE'}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M 80 -20 L 220 300"
          stroke={isDark ? '#233876' : '#BFDBFE'}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Path
          d="M 280 0 L 120 280"
          stroke={isDark ? '#1A2952' : '#DBEAFE'}
          strokeWidth="4"
        />
      </Svg>

      {/* Concentric Radar Rings */}
      <View pointerEvents="none" style={styles.centerOverlay}>
        {/* Ring 3 (Outer) */}
        <View
          style={[
            styles.outerRing,
            isDark ? styles.darkOuterRing : styles.lightOuterRing,
          ]}
        />
        {/* Ring 2 (Middle) */}
        <View
          style={[
            styles.middleRing,
            isDark ? styles.darkMiddleRing : styles.lightMiddleRing,
          ]}
        />
        {/* Ring 1 (Inner) */}
        <View
          style={[
            styles.innerRing,
            isDark ? styles.darkInnerRing : styles.lightInnerRing,
          ]}
        />
        {/* Target Center Dot */}
        <View
          style={[
            styles.targetDot,
            isDark ? styles.darkTargetDot : styles.lightTargetDot,
          ]}
        />
      </View>

      {/* Live Badge in Map Corner */}
      <View style={styles.badgeCorner}>
        <View
          style={[
            styles.gpsBadge,
            isDark ? styles.darkGpsBadge : styles.lightGpsBadge,
          ]}
        >
          <Text
            style={[
              styles.gpsBadgeText,
              isDark ? styles.darkGpsText : styles.lightGpsText,
            ]}
          >
            GPS Ativo
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  lightContainer: {
    backgroundColor: '#EBF3FA',
    borderColor: '#DBEAFE',
  },
  darkContainer: {
    backgroundColor: '#0B1536',
    borderColor: 'rgba(30, 58, 138, 0.5)',
  },
  svgAbsolute: {
    bottom: 0,
    left: 0,
    opacity: 0.6,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  centerOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  outerRing: {
    borderRadius: 65,
    height: 130,
    position: 'absolute',
    width: 130,
  },
  lightOuterRing: {
    backgroundColor: 'rgba(21, 101, 192, 0.08)',
  },
  darkOuterRing: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  middleRing: {
    borderRadius: 45,
    borderWidth: 2,
    height: 90,
    position: 'absolute',
    width: 90,
  },
  lightMiddleRing: {
    backgroundColor: 'rgba(21, 101, 192, 0.05)',
    borderColor: 'rgba(21, 101, 192, 0.25)',
  },
  darkMiddleRing: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  innerRing: {
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    position: 'absolute',
    width: 44,
  },
  lightInnerRing: {
    borderColor: '#1565C0',
  },
  darkInnerRing: {
    borderColor: '#38BDF8',
  },
  targetDot: {
    borderRadius: 8,
    borderWidth: 3,
    height: 16,
    width: 16,
  },
  lightTargetDot: {
    backgroundColor: '#1565C0',
    borderColor: '#BFDBFE',
  },
  darkTargetDot: {
    backgroundColor: '#38BDF8',
    borderColor: '#0C4A6E',
  },
  badgeCorner: {
    bottom: 10,
    position: 'absolute',
    right: 10,
  },
  gpsBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lightGpsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: '#BFDBFE',
  },
  darkGpsBadge: {
    backgroundColor: 'rgba(12, 74, 110, 0.85)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  gpsBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lightGpsText: {
    color: '#1565C0',
  },
  darkGpsText: {
    color: '#7DD3FC',
  },
});
