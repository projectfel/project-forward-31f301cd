/**
 * AnalyticsProvider
 * 
 * Wraps the app to auto-track page views on route changes.
 * Must be placed inside BrowserRouter and AuthProvider.
 */
import { useAnalytics } from "@/hooks/useAnalytics";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Auto-tracks page views on route changes
  useAnalytics();
  return <>{children}</>;
}
