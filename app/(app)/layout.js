import Sidebar from "../components/Sidebar";
import { BetsProvider } from "../context/BetsContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { AppShell } from "../components/AppShell";
import AppMain from "../components/AppMain";

export default function AppLayout({ children }) {
  return (
    <PreferencesProvider>
      <SubscriptionProvider>
        <BetsProvider>
          <AppShell>
            <Sidebar />
            <AppMain>
              {children}
            </AppMain>
          </AppShell>
        </BetsProvider>
      </SubscriptionProvider>
    </PreferencesProvider>
  );
}
