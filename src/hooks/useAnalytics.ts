/**
 * useAnalytics hook
 * 
 * Automatically tracks page views on route changes.
 * Provides tracking methods tied to current user session.
 */
import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackOrderCreated,
  trackSearch,
} from "@/services/analytics";

export function useAnalytics() {
  const { user } = useAuth();
  const location = useLocation();

  // Auto-track page views on route change (only for logged-in users)
  useEffect(() => {
    if (!user) return;
    trackPageView({ path: location.pathname, search: location.search });
  }, [location.pathname, location.search, user]);

  const trackProduct = useCallback(
    (storeId: string, productId: string, productName?: string) => {
      if (!user) return;
      trackProductView(storeId, productId, { product_name: productName });
    },
    [user]
  );

  const trackCart = useCallback(
    (storeId: string, productId: string, quantity?: number) => {
      if (!user) return;
      trackAddToCart(storeId, productId, { quantity });
    },
    [user]
  );

  const trackOrder = useCallback(
    (storeId: string, orderId?: string, total?: number) => {
      if (!user) return;
      trackOrderCreated(storeId, { order_id: orderId, total });
    },
    [user]
  );

  const trackSearchQuery = useCallback(
    (query: string, storeId?: string) => {
      if (!user) return;
      trackSearch(query, storeId);
    },
    [user]
  );

  return {
    trackProduct,
    trackCart,
    trackOrder,
    trackSearchQuery,
  };
}
