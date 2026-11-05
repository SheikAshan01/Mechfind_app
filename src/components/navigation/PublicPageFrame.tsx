import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../ui/Header';
import { ScreenContainer } from '../ui/ScreenContainer';
import { ResponsiveNav } from './ResponsiveNav';
import { WebFooter } from './WebFooter';

interface PublicPageFrameProps {
  title: string;
  children: React.ReactNode;
}

export const PublicPageFrame: React.FC<PublicPageFrameProps> = ({ title, children }) => {
  const { theme } = useTheme();
  const { horizontalPadding, maxContentWidth } = useResponsive();
  const showWebsiteNav = Platform.OS === 'web';

  if (showWebsiteNav) {
    return (
      <View style={[styles.webRoot, { backgroundColor: theme.background }]}>
        <ResponsiveNav />
        <ScrollView
          style={styles.webScrollView}
          contentContainerStyle={styles.webScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.webBody}>
            <View
              style={[
                styles.webContentContainer,
                {
                  paddingHorizontal: horizontalPadding,
                  maxWidth: maxContentWidth,
                },
              ]}
            >
              {children}
            </View>
          </View>
          <WebFooter />
        </ScrollView>
      </View>
    );
  }

  return (
    <ScreenContainer scrollable withPadding={false} edges={['top', 'left', 'right']}>
      <Header title={title} showBack showThemeToggle />
      <View
        style={{
          width: '100%',
          maxWidth: maxContentWidth,
          alignSelf: 'center',
          paddingHorizontal: horizontalPadding,
          paddingTop: 30,
          paddingBottom: 42,
          gap: 24,
          backgroundColor: theme.background,
        }}
      >
        {children}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    minHeight: '100%',
    width: '100%',
  },
  webScrollView: {
    flex: 1,
    width: '100%',
  },
  webScrollContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  webBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  webContentContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 36,
    paddingBottom: 56,
    gap: 24,
  },
});
