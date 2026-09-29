import { checkGluten } from '@/lib/gluten/check-gluten';
import { toProductInfo, type OffProduct } from '@/lib/open-food-facts';

// Real responses from Open Food Facts (trimmed), captured September 2026.
const PRINGLES: OffProduct = {
  product_name: 'Original Potato Crisps',
  brands: 'Pringles',
  ingredients_text_en:
    'DRIED POTATOES, VEGETABLE OIL (CORN, COTTONSEED, HIGH OLEIC SOYBEAN, SUNFLOWER OIL), DEGERMINATED YELLOW CORN FLOUR, CORNSTARCH, RICE FLOUR, MALTODEXTRIN, MONO -  AND DIGLYCERIDES, SALT, WHEAT STARCH.',
  allergens_tags: ['en:gluten', 'en:soybeans'],
  traces_tags: [],
  labels_tags: ['en:kosher', 'en:contains-gmos', 'en:orthodox-union-kosher'],
};

const CHEERIOS: OffProduct = {
  product_name: 'Cheerios',
  brands: 'Cheerios',
  ingredients_text_en: 'Whole Grain Oats, Corn Starch, Sugar, Salt, Tripotassium Phosphate, Vitamin E (mixed tocopherols)',
  allergens_tags: ['en:gluten', 'en:Corn'],
  traces_tags: [],
  labels_tags: ['en:kosher', 'en:orthodox-union-kosher', 'en:vitamin-b12-source'],
};

describe('toProductInfo', () => {
  it('flags Pringles for wheat starch', () => {
    expect(checkGluten(toProductInfo(PRINGLES)).verdict).toBe('contains-gluten');
  });

  it('marks Cheerios as caution because of oats, not contains', () => {
    expect(checkGluten(toProductInfo(CHEERIOS)).verdict).toBe('caution');
  });

  it('recognizes a certification label', () => {
    const info = toProductInfo({ ingredients_text: 'Rice', labels_tags: ['en:no-gluten', 'en:gfco-gluten-free'] });
    expect(info.glutenFreeLabel).toBe('certified');
  });

  it('recognizes a gluten-free claim', () => {
    const info = toProductInfo({ ingredients_text: 'Rice', labels_tags: ['en:no-gluten'] });
    expect(info.glutenFreeLabel).toBe('claimed');
  });

  it('falls back to allergen tags when ingredients are missing', () => {
    const info = toProductInfo({ allergens_tags: ['en:gluten'] });
    expect(info.allergens).toEqual(['gluten']);
    expect(checkGluten(info).verdict).toBe('contains-gluten');
  });

  it('passes through declared traces', () => {
    const info = toProductInfo({ ingredients_text: 'Corn', traces_tags: ['en:gluten'] });
    expect(checkGluten(info).verdict).toBe('caution');
  });

  it('returns unknown when Open Food Facts has no useful data', () => {
    expect(checkGluten(toProductInfo({ product_name: 'Mystery snack' })).verdict).toBe('unknown');
  });
});
