import type { ComponentProps } from 'react';
import { TalkiCard } from '@/design-system/components';

/** Quiet reading surface shared by the parent tabs. */
export function ParentCard({ style, ...props }: ComponentProps<typeof TalkiCard>) {
  return <TalkiCard {...props} style={[surface, style]} />;
}

const surface = { backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0, elevation: 0 } as const;
