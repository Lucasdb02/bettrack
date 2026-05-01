import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { BetsProvider } from "./context/BetsContext";

export const metadata = {
  title: "TrackMijnBets — Sports Betting Analyse Tool",
  description: "De professionele betting tracker voor Nederlandse sportwedders. Analyseer je bets, verbeter je resultaten.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('trackmijnbets_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;var r=document.documentElement;if(d){r.classList.add('dark');var v={'--bg-page':'#080c14','--bg-card':'rgba(14,22,44,0.72)','--bg-subtle':'rgba(20,30,56,0.5)','--bg-input':'rgba(6,12,24,0.85)','--bg-brand':'rgba(84,105,212,0.14)','--border':'rgba(255,255,255,0.09)','--border-subtle':'rgba(255,255,255,0.05)','--text-1':'#e6edf3','--text-2':'#c9d1d9','--text-3':'#8b949e','--text-4':'#6e7681','--badge-bg':'rgba(28,36,56,0.8)','--badge-color':'#94a3b8','--brand':'#7b9ef0','--brand-soft':'#3d5099','--tooltip-bg':'rgba(16,24,44,0.97)'};Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k]);});}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <BetsProvider>
            {children}
          </BetsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
