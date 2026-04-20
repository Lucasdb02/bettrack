import Sidebar from "../components/Sidebar";
import { BetsProvider } from "../context/BetsContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { AppShell } from "../components/AppShell";
import SessionTimeout from "../components/SessionTimeout";
import AppMain from "../components/AppMain";

export default function AppLayout({ children }) {
  return (
    <PreferencesProvider>
      <BetsProvider>
        <AppShell>
          <SessionTimeout />
          <Sidebar />
          <AppMain>
            {children}
          </AppMain>
        </AppShell>
      </BetsProvider>
    </PreferencesProvider>
  );
}
