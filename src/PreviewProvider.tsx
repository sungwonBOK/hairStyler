import { TDSMobileProvider } from '@toss/tds-mobile';
import type { PropsWithChildren } from 'react';

// Browser-only provider. Replace with the Apps in Toss provider for platform integration.
export function PreviewProvider({ children }: PropsWithChildren) {
  return <TDSMobileProvider userAgent={{ fontA11y: undefined, fontScale: undefined, isAndroid: /Android/i.test(navigator.userAgent), isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent), colorPreference: 'light' }}>{children}</TDSMobileProvider>;
}
