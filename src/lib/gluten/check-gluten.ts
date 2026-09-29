import { ADVISORY_PATTERN, GLUTEN_GRAIN_WORDS, INGREDIENT_RULES, SAFE_PHRASES } from './rules';
import type { Finding, GlutenResult, ProductInfo, Verdict } from './types';

/** Lowercase, straighten curly apostrophes, and collapse extra spaces. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Decides whether a product is safe for someone with celiac disease.
 *
 * Safety principle: when information is missing or unclear, the answer is
 * "caution" or "unknown", never a confident "safe".
 */
export function checkGluten(product: ProductInfo): GlutenResult {
  const findings: Finding[] = [];
  const text = normalize(product.ingredientsText ?? '');

  // Step 1: Find cross-contact warnings ("may contain wheat"), then remove
  // them so their grain words aren't mistaken for real ingredients.
  for (const match of text.matchAll(ADVISORY_PATTERN)) {
    if (GLUTEN_GRAIN_WORDS.test(match[0])) {
      findings.push({
        match: match[0].trim(),
        severity: 'caution',
        reason: 'The label warns about possible cross-contact with gluten.',
      });
    }
  }
  let remaining = text.replace(ADVISORY_PATTERN, ' ');

  // Step 2: Remove phrases that are safe even though they look risky.
  for (const phrase of SAFE_PHRASES) {
    remaining = remaining.replace(phrase, ' ');
  }

  // Step 3: Check what's left against every ingredient rule.
  for (const rule of INGREDIENT_RULES) {
    const match = remaining.match(rule.pattern);
    if (match) {
      findings.push({ match: match[0], severity: rule.severity, reason: rule.reason });
    }
  }

  // Step 4: Check the manufacturer's declared allergens and traces.
  const declaredAllergen = product.allergens?.map(normalize).find((a) => GLUTEN_GRAIN_WORDS.test(a));
  if (declaredAllergen) {
    findings.push({
      match: declaredAllergen,
      severity: 'contains',
      reason: `The manufacturer lists ${declaredAllergen} as an allergen.`,
    });
  }
  const declaredTrace = product.traces?.map(normalize).find((t) => GLUTEN_GRAIN_WORDS.test(t));
  if (declaredTrace) {
    findings.push({
      match: declaredTrace,
      severity: 'caution',
      reason: `The manufacturer says it may contain traces of ${declaredTrace}.`,
    });
  }

  const certified = product.glutenFreeLabel === 'certified';
  return { verdict: decideVerdict(product, text, findings), findings, certified };
}

function decideVerdict(product: ProductInfo, text: string, findings: Finding[]): Verdict {
  // A gluten ingredient always wins, even over a gluten-free label — if the
  // data conflicts, we'd rather be wrong on the safe side.
  if (findings.some((f) => f.severity === 'contains')) return 'contains-gluten';

  const label = product.glutenFreeLabel;
  if (label === 'certified' || label === 'claimed') return 'gluten-free-label';

  if (findings.some((f) => f.severity === 'caution')) return 'caution';

  // No ingredient list means we can't say anything about the product.
  if (text.length === 0) return 'unknown';

  return 'no-gluten-ingredients';
}
