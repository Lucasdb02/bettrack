'use client';

export default function AppMain({ children }) {
  return (
    <main className="flex-1 overflow-auto app-main mobile-header-shown">
      {children}
    </main>
  );
}
