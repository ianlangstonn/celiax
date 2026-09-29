import type { Severity } from './types';

export type Rule = {
  pattern: RegExp;
  severity: Severity;
  reason: string;
};

/*
 * Patterns use \b ("word boundary") so we only match whole words:
 *   /\bwheat\b/ matches "wheat flour" but NOT "buckwheat".
 *   /\bmalt\b/  matches "barley malt" but NOT "maltodextrin" or "isomalt".
 *   /\boats?\b/ matches "oats" but NOT "goat milk".
 */
export const INGREDIENT_RULES: Rule[] = [
  // --- Grains that contain gluten ---
  {
    pattern: /\bwheat\b(?![\s-]*free)/,
    severity: 'contains',
    reason: 'Wheat contains gluten.',
  },
  {
    pattern: /\bbarley\b/,
    severity: 'contains',
    reason: 'Barley contains gluten. US law does not require barley to be listed as an allergen, so it only shows up in the ingredients.',
  },
  {
    pattern: /\brye\b/,
    severity: 'contains',
    reason: 'Rye contains gluten.',
  },
  {
    pattern: /\b(spelt|farro|durum|semolina|einkorn|emmer|kamut|khorasan|triticale|farina|graham)\b/,
    severity: 'contains',
    reason: 'This is a type of wheat (or a wheat hybrid) and contains gluten.',
  },
  {
    pattern: /\b(bulgur|couscous|seitan|freekeh)\b/,
    severity: 'contains',
    reason: 'This is made from wheat and contains gluten.',
  },
  {
    pattern: /\bmalt(ed)?\b/,
    severity: 'contains',
    reason: 'Malt is usually made from barley, which contains gluten. (Maltodextrin, maltose and maltitol are different and are gluten-free.)',
  },
  {
    pattern: /\bbrewer'?s yeast\b/,
    severity: 'contains',
    reason: "Brewer's yeast is a byproduct of beer brewing and usually contains barley.",
  },
  {
    pattern: /\bgluten\b(?![\s-]*free)/,
    severity: 'contains',
    reason: 'Gluten is listed as an ingredient.',
  },

  // --- Ingredients that often (but not always) contain gluten ---
  {
    pattern: /\b(oats?|oatmeal)\b/,
    severity: 'caution',
    reason: 'Regular oats are often cross-contaminated with wheat. Only oats labeled gluten-free are considered safe.',
  },
  {
    pattern: /\b(soy sauce|shoyu|teriyaki)\b/,
    severity: 'caution',
    reason: 'Soy sauce is usually brewed with wheat unless it says gluten-free.',
  },
  {
    pattern: /\byeast extract\b/,
    severity: 'caution',
    reason: 'Yeast extract is sometimes made from barley.',
  },
  {
    pattern: /\bsmoke flavou?r(ing)?\b/,
    severity: 'caution',
    reason: 'Smoke flavoring can be made with barley malt flour.',
  },
];

/**
 * Phrases that look like gluten but are actually safe. They're removed from the
 * text before the rules run, so "gluten-free oats" doesn't trigger the oats rule.
 */
export const SAFE_PHRASES: RegExp[] = [/\b(certified\s+)?gluten[\s-]*free\s+(oats?|oat flour|rolled oats|oatmeal|soy sauce|tamari)\b/g];

/**
 * Cross-contact warnings like "May contain wheat" or "Made in a facility that
 * also processes wheat". These mean possible cross-contact, not a gluten
 * ingredient, so they're handled separately from the ingredient rules.
 *
 * Each match starts at a key word ("may contain", "facility", "equipment"...)
 * and runs to the end of the sentence. Starting at the key word matters:
 * in "tuna packed in water, wheat flour" there's no key word, so the wheat is
 * still treated as a real ingredient instead of a warning.
 */
export const ADVISORY_PATTERN =
  /\b(may (also )?contain|facility|facilities|equipment|(shared|same) (production )?lines?)\b[^.;]*/g;

export const GLUTEN_GRAIN_WORDS = /\b(wheat|gluten|barley|rye|oats?)\b/;
