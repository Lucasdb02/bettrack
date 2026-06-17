import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";

export const metadata = {
  title: "TrackMijnBets — Sports Betting Analyse Tool",
  description: "De professionele betting tracker voor Nederlandse sportwedders. Analyseer je bets, verbeter je resultaten.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('trackmijnbets_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;var r=document.documentElement;if(d){r.classList.add('dark');var v={'--bg-page':'#121212','--bg-card':'#1a1a1a','--bg-subtle':'#1e1e1e','--bg-input':'#161616','--bg-brand':'rgba(99,102,241,0.1)','--border':'#333333','--border-subtle':'#2a2a2a','--text-1':'#e0e0e0','--text-2':'#b0b0b0','--text-3':'#888888','--text-4':'#555555','--badge-bg':'#1e1e1e','--badge-color':'#888888','--brand':'#818cf8','--brand-soft':'#4338ca','--tooltip-bg':'#1a1a1a'};Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k]);});}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
