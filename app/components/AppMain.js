'use client';
import { useTheme } from '../context/ThemeContext';

export default function AppMain({ children }) {
  const { dark } = useTheme();

  return (
    <main
      className="flex-1 overflow-auto app-main mobile-header-shown"
      style={dark ? {} : {
        margin: '10px 10px 10px 10px',
        borderRadius: 14,
        background: '#ffffff',
        border: '1px solid #e4e4e4',
        minHeight: 'calc(100vh - 20px)',
        overflowX: 'hidden',
      }}
    >
      {children}
    </main>
  );
}
