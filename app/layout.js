import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";

export const metadata = {
  title: "TrackMijnBets — Sports Betting Analyse Tool",
  description: "De professionele betting tracker voor Nederlandse sportwedders. Analyseer je bets, verbeter je resultaten.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('trackmijnbets_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme:dark)').matches;var r=document.documentElement;if(d){r.classList.add('dark');var v={'--bg-page':'#0d1117','--bg-card':'#161c2a','--bg-subtle':'#1c2335','--bg-input':'#0d1117','--bg-brand':'rgba(84,105,212,0.12)','--border':'#2a3347','--border-subtle':'#1e293b','--text-1':'#e6edf3','--text-2':'#c9d1d9','--text-3':'#8b949e','--text-4':'#6e7681','--badge-bg':'#1c2335','--badge-color':'#94a3b8','--brand':'#7b9ef0','--brand-soft':'#3d5099','--tooltip-bg':'#1c2335'};Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k]);});}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
