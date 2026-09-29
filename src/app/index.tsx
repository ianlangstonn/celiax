import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Wordmark } from '@/components/wordmark';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Wordmark fontSize={76} color={theme.tint} />
          <ThemedText type="default" themeColor="textSecondary" style={styles.tagline}>
            Eat with confidence
          </ThemedText>
        </View>

        <View style={styles.center}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan a barcode"
            onPress={() => router.navigate('/scan')}
            style={({ pressed }) => [
              styles.scanButton,
              { backgroundColor: theme.tint, borderColor: theme.tintSoft },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' }}
              tintColor="#ffffff"
              size={64}
            />
          </Pressable>
          <ThemedText type="smallBold" style={styles.tapLabel}>
            Tap to scan
          </ThemedText>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Checks ingredients, gluten-free labels, and cross-contact warnings.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.five,
    gap: Spacing.one,
  },
  tagline: {
    fontSize: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  scanButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  tapLabel: {
    fontSize: 18,
  },
  footer: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
