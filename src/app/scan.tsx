import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

// The barcode formats printed on grocery products in the US.
const PRODUCT_BARCODES = ['upc_a', 'upc_e', 'ean13', 'ean8'] as const;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  // Permission status is still loading.
  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  // We don't have camera access yet: explain why we need it and ask.
  if (!permission.granted) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle" style={styles.centerText}>
          Camera access
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.centerText}>
          Celiax needs your camera to scan barcodes on food packaging.
        </ThemedText>
        {permission.canAskAgain ? (
          <Pressable style={styles.button} onPress={requestPermission}>
            <ThemedText style={styles.buttonText}>Allow camera</ThemedText>
          </Pressable>
        ) : (
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Turn on camera access for Expo Go in the iPhone Settings app.
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    setScannedCode(result.data);
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...PRODUCT_BARCODES] }}
        // Stop scanning once we have a code, so it doesn't fire over and over.
        onBarcodeScanned={scannedCode ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {scannedCode ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText themeColor="textSecondary">Scanned barcode</ThemedText>
            <ThemedText type="subtitle">{scannedCode}</ThemedText>
            <Pressable style={styles.button} onPress={() => setScannedCode(null)}>
              <ThemedText style={styles.buttonText}>Scan again</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <View style={styles.hint}>
            <ThemedText style={styles.hintText}>Point your camera at a barcode</ThemedText>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  centerText: {
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  hint: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  hintText: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    marginTop: Spacing.two,
  },
  buttonText: {
    color: '#ffffff',
  },
});
