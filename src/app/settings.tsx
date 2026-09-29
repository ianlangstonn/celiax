import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppearanceToggle } from '@/components/appearance-toggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { getAppearancePreference, setAppearancePreference, type AppearancePreference } from '@/lib/appearance';

export default function SettingsScreen() {
  const [appearance, setAppearance] = useState(getAppearancePreference);

  function chooseAppearance(preference: AppearancePreference) {
    setAppearance(preference);
    setAppearancePreference(preference);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Settings</ThemedText>

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Appearance
            </ThemedText>
            <AppearanceToggle value={appearance} onChange={chooseAppearance} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
});
