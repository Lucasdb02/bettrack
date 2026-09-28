import { Suspense } from 'react';

/* Inlogpagina's niet indexeren; /signup wel (die zet zijn eigen metadata) */
export const metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }) {
  return <Suspense>{children}</Suspense>;
}
