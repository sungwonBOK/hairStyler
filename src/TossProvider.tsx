import { TDSMobileAITProvider } from '@toss/tds-mobile-ait';
import type { PropsWithChildren } from 'react';
export default function TossProvider({ children }: PropsWithChildren) { return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>; }
