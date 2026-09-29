import type { ProductInfo } from '@/lib/gluten/types';

/**
 * Open Food Facts is a free, open database of food products.
 * API docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 * Limit: 15 product lookups per minute per IP address.
 */
const API_URL = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = [
  'product_name',
  'brands',
  'ingredients_text_en',
  'ingredients_text',
  'allergens_tags',
  'traces_tags',
  'labels_tags',
  'image_front_small_url',
].join(',');

// Open Food Facts asks every app to identify itself.
const USER_AGENT = 'Celiax/1.0 (https://github.com/ianlangstonn/celiax)';

// Label tags from the Open Food Facts label taxonomy.
const CERTIFIED_GF_LABELS = [
  'en:certified-gluten-free',
  'en:gfco-gluten-free',
  'en:crossed-grain-trademark',
  'en:dzg-gluten-free',
  'en:beyond-celiac-gluten-free',
  'en:canadian-celiac-association-gluten-free',
];
const CLAIMED_GF_LABELS = ['en:no-gluten', 'en:free-from-dairy-and-gluten', 'en:suitable-for-celiacs'];

/** The raw product shape Open Food Facts sends back (only the fields we ask for). */
export type OffProduct = {
  product_name?: string;
  brands?: string;
  ingredients_text_en?: string;
  ingredients_text?: string;
  allergens_tags?: string[];
  traces_tags?: string[];
  labels_tags?: string[];
  image_front_small_url?: string;
};

export type Product = {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  info: ProductInfo;
};

export type LookupResult =
  | { status: 'found'; product: Product }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

/** Look up a product by barcode. Never throws — errors come back as a result. */
export async function lookupProduct(barcode: string): Promise<LookupResult> {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (response.status === 404) return { status: 'not-found' };
    if (!response.ok) return { status: 'error', message: `Open Food Facts returned error ${response.status}.` };

    const data: { status: number; product?: OffProduct } = await response.json();
    if (data.status !== 1 || !data.product) return { status: 'not-found' };

    return { status: 'found', product: toProduct(barcode, data.product) };
  } catch {
    return { status: 'error', message: "Couldn't reach Open Food Facts. Check your internet connection." };
  }
}

/** Convert Open Food Facts' format into Celiax's own format. */
export function toProduct(barcode: string, off: OffProduct): Product {
  return {
    barcode,
    name: off.product_name?.trim() || null,
    brand: off.brands?.split(',')[0]?.trim() || null,
    imageUrl: off.image_front_small_url || null,
    info: toProductInfo(off),
  };
}

export function toProductInfo(off: OffProduct): ProductInfo {
  const ingredientsText = (off.ingredients_text_en || off.ingredients_text || '').trim();
  const labels = off.labels_tags ?? [];

  return {
    ingredientsText,
    // Open Food Facts calculates allergens partly from the ingredient list
    // (e.g. it marks all oats as "gluten"). When we have the ingredients, our
    // own checker reads them more precisely, so we only use the allergen tags
    // as a fallback when the ingredient list is missing.
    allergens: ingredientsText ? [] : stripLanguage(off.allergens_tags),
    traces: stripLanguage(off.traces_tags),
    glutenFreeLabel: labels.some((l) => CERTIFIED_GF_LABELS.includes(l))
      ? 'certified'
      : labels.some((l) => CLAIMED_GF_LABELS.includes(l))
        ? 'claimed'
        : 'none',
  };
}

/** "en:wheat" → "wheat" */
function stripLanguage(tags: string[] | undefined): string[] {
  return (tags ?? []).map((tag) => tag.replace(/^[a-z]{2}:/, '').replace(/-/g, ' '));
}
