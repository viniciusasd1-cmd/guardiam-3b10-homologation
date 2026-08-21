import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export interface ApprovedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  testID?: string;
}

const SIZE_MAP = {
  sm: 36,
  md: 48,
  lg: 72,
  xl: 96,
};

export const ApprovedLogo: React.FC<ApprovedLogoProps> = ({
  size = 'md',
  testID = 'approved-logo',
}) => {
  const dimension = SIZE_MAP[size] || 48;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Guardiam Shield Logo"
      testID={testID}
      style={[styles.container, { width: dimension, height: dimension }]}
    >
      <Svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
      >
        <Defs>
          <LinearGradient
            id="shieldOuterGrad"
            x1="18"
            y1="8"
            x2="82"
            y2="92"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#0284C7" />
            <Stop offset="0.35" stopColor="#0369A1" />
            <Stop offset="0.7" stopColor="#0F2B5C" />
            <Stop offset="1" stopColor="#0B1A3A" />
          </LinearGradient>

          <LinearGradient
            id="shieldInnerGrad"
            x1="24"
            y1="14"
            x2="76"
            y2="84"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#0EA5E9" />
            <Stop offset="0.45" stopColor="#0284C7" />
            <Stop offset="1" stopColor="#0C234B" />
          </LinearGradient>

          <LinearGradient
            id="shieldSpecular"
            x1="50"
            y1="14"
            x2="74"
            y2="62"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
            <Stop offset="0.4" stopColor="#BAE6FD" stopOpacity={0.2} />
            <Stop offset="1" stopColor="#0369A1" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Outer Shield Frame with Highlights */}
        <Path
          d="M50 8L82 20C82 48 68 76 50 92C32 76 18 48 18 20L50 8Z"
          fill="url(#shieldOuterGrad)"
          stroke="#7DD3FC"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Bevel */}
        <Path
          d="M50 14L76 24C76 48 64 71 50 84C36 71 24 48 24 24L50 14Z"
          fill="url(#shieldInnerGrad)"
          stroke="#0369A1"
          strokeWidth="1.5"
        />

        {/* Left Side Shadow / Right Side Highlight Divider */}
        <Path
          d="M50 14L50 84C64 71 76 48 76 24L50 14Z"
          fill="#38BDF8"
          fillOpacity={0.12}
        />

        {/* Shield Specular Crest */}
        <Path
          d="M50 14L74 23.5C72 38 65 52 50 62L50 14Z"
          fill="url(#shieldSpecular)"
        />

        {/* Crisp Bold Letter 'G' */}
        <Path
          d="M58 35C55.5 33.2 52.5 32 48.5 32C40 32 34 38 34 49C34 60 40 66 49 66C56 66 61 62 62.5 56H49V48H70V70C64.5 73.5 57.5 75 49 75C34 75 24 64 24 49C24 34 34 23 49 23C55 23 60.5 25.5 64.5 29.5L58 35Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
