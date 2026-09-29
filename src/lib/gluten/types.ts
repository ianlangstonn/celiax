/**
 * The possible answers the gluten checker can give, from safest to least safe.
 * "unknown" is used whenever there isn't enough information — we never guess.
 */
export type Verdict =
  | 'gluten-free-label' // Product is labeled or certified gluten-free
  | 'no-gluten-ingredients' // Ingredients look fine, but no gluten-free label
  | 'caution' // Something might contain gluten or has cross-contact risk
  | 'contains-gluten' // An ingredient contains gluten
  | 'unknown'; // Not enough information to decide

export type Severity = 'contains' | 'caution';

/** One reason the checker flagged something, e.g. "barley malt" → contains. */
export type Finding = {
  /** The exact text from the product that triggered this finding. */
  match: string;
  severity: Severity;
  /** Plain-English explanation shown to the user. */
  reason: string;
};

/** Everything we know about a product, from any source (barcode, photo, typing). */
export type ProductInfo = {
  ingredientsText?: string | null;
  /** Allergens the manufacturer declared, e.g. ["wheat", "milk"]. */
  allergens?: string[];
  /** "May contain" traces the manufacturer declared, e.g. ["gluten"]. */
  traces?: string[];
  glutenFreeLabel?: 'none' | 'claimed' | 'certified';
};

export type GlutenResult = {
  verdict: Verdict;
  findings: Finding[];
  /** True only when the product carries a gluten-free certification. */
  certified: boolean;
};
