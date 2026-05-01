import Sidebar from "../components/Sidebar";
import { PreferencesProvider } from "../context/PreferencesContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { AppShell } from "../components/AppShell";
import SessionTimeout from "../components/SessionTimeout";
import AppMain from "../components/AppMain";

export default function AppLayout({ children }) {
  return (
    <PreferencesProvider>
      <SubscriptionProvider>
        <AppShell>
          <SessionTimeout />
          <Sidebar />
          <AppMain>
            {children}
          </AppMain>
        </AppShell>
      </SubscriptionProvider>
    </PreferencesProvider>
  );
}
