import { useEffect, useState } from 'react';

import { lookupProduct, type LookupResult } from '@/lib/open-food-facts';

export type LookupState = { status: 'idle' } | { status: 'loading' } | LookupResult;

/** Looks up a barcode whenever it changes. Pass null to reset. */
export function useProductLookup(barcode: string | null): LookupState {
  const [state, setState] = useState<LookupState>({ status: 'idle' });

  useEffect(() => {
    if (!barcode) {
      setState({ status: 'idle' });
      return;
    }

    // If the barcode changes before the lookup finishes, ignore the old answer.
    let cancelled = false;
    setState({ status: 'loading' });
    lookupProduct(barcode).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  return state;
}
