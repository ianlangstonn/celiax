import type { GlutenResult, Verdict } from '@/lib/gluten/types';

type VerdictDisplay = {
  emoji: string;
  title: string;
  description: string;
  color: string;
};

const DISPLAY: Record<Verdict, VerdictDisplay> = {
  'gluten-free-label': {
    emoji: '✅',
    title: 'Labeled gluten-free',
    description: 'The package says gluten-free. By FDA rules, that means under 20 ppm of gluten.',
    color: '#1B7F3B',
  },
  'no-gluten-ingredients': {
    emoji: '🟢',
    title: 'No gluten ingredients',
    description: "Nothing in the ingredients contains gluten, but it isn't labeled gluten-free, so cross-contact is possible.",
    color: '#2F7D5B',
  },
  caution: {
    emoji: '🟡',
    title: 'Caution',
    description: 'Something here might contain gluten. See why below.',
    color: '#9A5B00',
  },
  'contains-gluten': {
    emoji: '🔴',
    title: 'Contains gluten',
    description: 'Not safe for people with celiac disease.',
    color: '#C0262D',
  },
  unknown: {
    emoji: '⚪',
    title: 'Not enough info',
    description: "We couldn't find an ingredient list for this product. Check the package.",
    color: '#5F6368',
  },
};

export function getVerdictDisplay(result: GlutenResult): VerdictDisplay {
  const display = DISPLAY[result.verdict];
  if (result.verdict === 'gluten-free-label' && result.certified) {
    return { ...display, title: 'Certified gluten-free', description: 'Certified by a gluten-free certification program.' };
  }
  return display;
}
