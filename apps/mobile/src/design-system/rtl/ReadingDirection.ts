import { createContext } from 'react';

/** Reading surfaces opt into bidi alignment instead of physical text alignment. */
export const ReadingDirection = createContext<'rtl' | undefined>(undefined);
