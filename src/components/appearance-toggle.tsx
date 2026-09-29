import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { AppearancePreference } from '@/lib/appearance';

const OPTIONS: { value: AppearancePreference; label: string; icon: SFSymbol }[] = [
  { value: 'light', label: 'Light', icon: 'sun.max.fill' },
  { value: 'dark', label: 'Dark', icon: 'moon.fill' },
  { value: 'system', label: 'System', icon: 'desktopcomputer' },
];

type Props = {
  value: AppearancePreference;
  onChange: (value: AppearancePreference) => void;
};

/** A compact sun / moon / computer switch. Only the selected option shows its name. */
export function AppearanceToggle({ value, onChange }: Props) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        const color = selected ? '#ffffff' : theme.textSecondary;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && { backgroundColor: theme.tint }]}>
            <SymbolView name={option.icon} tintColor={color} size={18} weight="semibold" />
            {selected && <Text style={[styles.label, { color }]}>{option.label}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: Spacing.one,
    gap: Spacing.one,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 15,
    fontWeight: 700,
  },
});
