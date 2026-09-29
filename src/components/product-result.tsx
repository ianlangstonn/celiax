import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getVerdictDisplay } from '@/constants/verdicts';
import type { LookupState } from '@/hooks/use-product-lookup';
import { checkGluten } from '@/lib/gluten/check-gluten';
import type { Product } from '@/lib/open-food-facts';

type Props = {
  barcode: string;
  state: LookupState;
  onScanAgain: () => void;
};

export function ProductResult({ barcode, state, onScanAgain }: Props) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ScrollView contentContainerStyle={styles.content}>
        {state.status === 'loading' && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" />
            <ThemedText themeColor="textSecondary">Looking up {barcode}…</ThemedText>
          </View>
        )}

        {state.status === 'not-found' && (
          <View style={styles.centered}>
            <ThemedText type="smallBold">Product not found</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              Barcode {barcode} isn&apos;t in Open Food Facts yet. Check the ingredients on the package.
            </ThemedText>
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.centered}>
            <ThemedText type="smallBold">Something went wrong</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.centerText}>
              {state.message}
            </ThemedText>
          </View>
        )}

        {state.status === 'found' && <ProductVerdict product={state.product} />}
      </ScrollView>

      <Pressable style={styles.button} onPress={onScanAgain}>
        <Text style={styles.buttonText}>Scan again</Text>
      </Pressable>
    </ThemedView>
  );
}

function ProductVerdict({ product }: { product: Product }) {
  const result = checkGluten(product.info);
  const display = getVerdictDisplay(result);

  return (
    <View style={styles.verdictContainer}>
      <View style={[styles.banner, { backgroundColor: display.color }]}>
        <Text style={styles.bannerTitle}>
          {display.emoji} {display.title}
        </Text>
        <Text style={styles.bannerDescription}>{display.description}</Text>
      </View>

      <View style={styles.productRow}>
        {product.imageUrl && <Image source={product.imageUrl} style={styles.image} contentFit="contain" />}
        <View style={styles.productText}>
          <ThemedText type="smallBold">{product.name ?? 'Unnamed product'}</ThemedText>
          {product.brand && <ThemedText themeColor="textSecondary">{product.brand}</ThemedText>}
        </View>
      </View>

      {result.findings.length > 0 && (
        <View style={styles.findings}>
          <ThemedText type="smallBold">Why</ThemedText>
          {result.findings.map((finding) => (
            <View key={finding.match + finding.severity} style={styles.finding}>
              <ThemedText type="small">
                {finding.severity === 'contains' ? '🔴' : '🟡'} &ldquo;{finding.match}&rdquo;
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {finding.reason}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {product.info.ingredientsText ? (
        <View style={styles.findings}>
          <ThemedText type="smallBold">Ingredients</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {product.info.ingredientsText}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        Data from Open Food Facts. Recipes change, so always double-check the package.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    maxHeight: '75%',
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  content: {
    gap: Spacing.three,
  },
  centered: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  centerText: {
    textAlign: 'center',
  },
  verdictContainer: {
    gap: Spacing.three,
  },
  banner: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 700,
  },
  bannerDescription: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  productText: {
    flex: 1,
  },
  findings: {
    gap: Spacing.two,
  },
  finding: {
    gap: Spacing.half,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.two + Spacing.one,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 600,
  },
});
