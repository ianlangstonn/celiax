import { useState } from 'react';
import { StyleSheet, Text, View, type TextLayoutEvent } from 'react-native';

import { LEAF_HEIGHT, LEAF_WIDTH, LeafMark, STEM_END } from '@/components/leaf-mark';

type Props = {
  fontSize: number;
  color: string;
};

const LETTER_SPACING = -1.5;
// How big the leaf is compared to the letters.
const LEAF_SCALE = 0.42;
// Space between the leaf's stem and the "ı", matching the look of the gaps between letters.
const GAP = 0.035;
// SF Pro's x-height (the top of a lowercase "ı") as a fraction of the font size.
// Only used if the phone doesn't report the real value.
const FALLBACK_X_HEIGHT = 0.53;

/**
 * "Celiax" with the leaf growing out of the "i" in place of its dot.
 * We measure where the "i" really lands on screen, then put the leaf's stem
 * right on top of it.
 */
export function Wordmark({ fontSize, color }: Props) {
  const lineHeight = Math.round(fontSize * 1.1);
  const [iWidth, setIWidth] = useState(0);
  const [xHeightTop, setXHeightTop] = useState(lineHeight - fontSize * (0.25 + FALLBACK_X_HEIGHT));

  const leafWidth = fontSize * LEAF_SCALE;
  const leafHeight = (leafWidth * LEAF_HEIGHT) / LEAF_WIDTH;
  const textStyle = [styles.text, { fontSize, lineHeight, color }];

  function measureI(event: TextLayoutEvent) {
    const line = event.nativeEvent.lines[0];
    if (line?.xHeight) {
      // Baseline is `ascender` below the top of the line; the "ı" is `xHeight` tall.
      setXHeightTop(line.y + line.ascender - line.xHeight);
    }
  }

  // Letter spacing is added after each letter, so remove it to find the i's center.
  const iCenter = (iWidth - LETTER_SPACING) / 2;

  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="Celiax">
      <Text style={textStyle}>Cel</Text>
      <View>
        <Text style={textStyle} onTextLayout={measureI} onLayout={(e) => setIWidth(e.nativeEvent.layout.width)}>
          ı
        </Text>
        {iWidth > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: iCenter - leafWidth * STEM_END.dot.x,
              // The bottom of the stem sits one letter-gap above the top of the "ı".
              top: xHeightTop - fontSize * GAP - leafHeight * STEM_END.dot.y,
            }}>
            <LeafMark width={leafWidth} color={color} variant="dot" />
          </View>
        )}
      </View>
      <Text style={textStyle}>ax</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  text: {
    fontWeight: 900,
    letterSpacing: LETTER_SPACING,
  },
});
