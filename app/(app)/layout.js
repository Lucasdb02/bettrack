import Sidebar from "../components/Sidebar";
import { BetsProvider } from "../context/BetsContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { AppShell } from "../components/AppShell";
import SessionTimeout from "../components/SessionTimeout";

export default function AppLayout({ children }) {
  return (
    <PreferencesProvider>
      <BetsProvider>
        <AppShell>
          <SessionTimeout />
          <Sidebar />
          <main className="flex-1 overflow-auto app-main">
            {children}
          </main>
        </AppShell>
      </BetsProvider>
    </PreferencesProvider>
  );
}
