import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Image } from 'react-native';

interface MechfindLogoProps {
  isDark?: boolean;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const MechfindLogo: React.FC<MechfindLogoProps> = ({
  isDark = false,
  width = 148,
  height = 44,
  style,
}) => {
  return (
    <View style={[{ width, height, justifyContent: 'center', alignItems: 'center' }, style]}>
      <Image
        source={require('../../../assets/images/mechfind-official-logo.png')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );
};
