import { checkGluten } from '../check-gluten';

// Shortcut: check a plain ingredient list and return just the verdict.
const verdictFor = (ingredientsText: string) => checkGluten({ ingredientsText }).verdict;

describe('gluten ingredients', () => {
  it.each([
    'Enriched wheat flour, sugar, salt',
    'Water, BARLEY, salt', // uppercase
    'Rye flour, water, yeast',
    'Spelt flour, honey',
    'Semolina, water',
    'Rice, barley malt extract, sugar',
    'Milk, malted milk powder, cocoa',
    "Brewer's yeast, salt",
    'Vital wheat gluten, water',
    'Couscous, olive oil',
  ])('flags "%s" as contains-gluten', (text) => {
    expect(verdictFor(text)).toBe('contains-gluten');
  });
});

describe('look-alike words that are actually gluten-free', () => {
  it.each([
    'Buckwheat flour, water, salt',
    'Corn, maltodextrin, salt',
    'Sugar, maltose, isomalt, maltitol',
    'Goat milk, salt, enzymes',
    'Rice flour, tapioca starch, xanthan gum',
  ])('treats "%s" as no-gluten-ingredients', (text) => {
    expect(verdictFor(text)).toBe('no-gluten-ingredients');
  });
});

describe('caution ingredients', () => {
  it('flags regular oats', () => {
    expect(verdictFor('Whole grain rolled oats, sugar')).toBe('caution');
  });

  it('allows gluten-free oats', () => {
    expect(verdictFor('Gluten-free oats, sugar')).toBe('no-gluten-ingredients');
    expect(verdictFor('Certified gluten free rolled oats, honey')).toBe('no-gluten-ingredients');
  });

  it('flags soy sauce', () => {
    expect(verdictFor('Chicken, soy sauce, garlic')).toBe('caution');
  });

  it('allows gluten-free soy sauce', () => {
    expect(verdictFor('Chicken, gluten-free soy sauce, garlic')).toBe('no-gluten-ingredients');
  });

  it('flags yeast extract', () => {
    expect(verdictFor('Potatoes, oil, yeast extract')).toBe('caution');
  });
});

describe('cross-contact warnings', () => {
  it('treats "may contain wheat" as caution, not contains', () => {
    expect(verdictFor('Peanuts, salt. May contain wheat.')).toBe('caution');
  });

  it('treats a shared facility warning as caution', () => {
    expect(verdictFor('Almonds, salt. Made in a facility that also processes wheat and soy.')).toBe('caution');
  });

  it('ignores warnings that do not mention gluten', () => {
    expect(verdictFor('Rice, salt. May contain peanuts and tree nuts.')).toBe('no-gluten-ingredients');
  });

  it('still flags real wheat ingredients next to a warning', () => {
    expect(verdictFor('Wheat flour, sugar. May contain peanuts.')).toBe('contains-gluten');
  });

  it('does not treat "packed in" as a warning', () => {
    expect(verdictFor('Tuna packed in water, wheat flour, salt')).toBe('contains-gluten');
  });
});

describe('labels and declared allergens', () => {
  it('returns gluten-free-label for a certified product', () => {
    const result = checkGluten({ ingredientsText: 'Rice, sugar', glutenFreeLabel: 'certified' });
    expect(result.verdict).toBe('gluten-free-label');
    expect(result.certified).toBe(true);
  });

  it('trusts a gluten-free claim even without ingredients', () => {
    expect(checkGluten({ glutenFreeLabel: 'claimed' }).verdict).toBe('gluten-free-label');
  });

  it('lets a gluten ingredient override a gluten-free label', () => {
    expect(checkGluten({ ingredientsText: 'Wheat flour', glutenFreeLabel: 'claimed' }).verdict).toBe('contains-gluten');
  });

  it('flags a declared wheat allergen', () => {
    expect(checkGluten({ ingredientsText: 'Flour, sugar', allergens: ['Wheat', 'Milk'] }).verdict).toBe('contains-gluten');
  });

  it('flags declared gluten traces as caution', () => {
    expect(checkGluten({ ingredientsText: 'Corn, salt', traces: ['gluten'] }).verdict).toBe('caution');
  });
});

describe('missing information', () => {
  it('returns unknown when there are no ingredients', () => {
    expect(checkGluten({}).verdict).toBe('unknown');
    expect(verdictFor('')).toBe('unknown');
    expect(verdictFor('   ')).toBe('unknown');
  });
});

describe('findings', () => {
  it('explains why a product was flagged', () => {
    const { findings } = checkGluten({ ingredientsText: 'Rice, barley malt, salt' });
    expect(findings.map((f) => f.match)).toEqual(expect.arrayContaining(['barley', 'malt']));
    expect(findings.every((f) => f.reason.length > 0)).toBe(true);
  });
});
