import Sidebar from "../components/Sidebar";
import { BetsProvider } from "../context/BetsContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { AppShell } from "../components/AppShell";

export default function AppLayout({ children }) {
  return (
    <PreferencesProvider>
      <BetsProvider>
        <AppShell>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </AppShell>
      </BetsProvider>
    </PreferencesProvider>
  );
}
