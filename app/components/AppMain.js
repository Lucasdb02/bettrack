'use client';
import { usePathname } from 'next/navigation';

export default function AppMain({ children }) {
  const pathname = usePathname();
  const showHeader = pathname === '/dashboard';
  return (
    <main className={`flex-1 overflow-auto app-main${showHeader ? ' mobile-header-shown' : ''}`}>
      {children}
    </main>
  );
}
