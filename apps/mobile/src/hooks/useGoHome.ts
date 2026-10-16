import { useCallback, useRef } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { homeHref } from '@/domain/navigation/routes';

/** Return to the existing Home route, or replace a directly opened route. */
export function useGoHome(): () => void {
  const router = useRouter();
  const busy = useRef(false);
  useFocusEffect(useCallback(() => { busy.current = false; }, []));
  return useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    router.dismissTo(homeHref);
  }, [router]);
}
