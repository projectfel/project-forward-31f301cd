/**
 * useAnalyticsData hook
 * 
 * Fetches aggregated analytics data for dashboard display.
 * Supports date range filtering and store scoping.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

/** Daily stats for a store */
export function useStoreDailyStats(storeId: string | undefined, range: DateRange) {
  return useQuery({
    queryKey: ["analytics", "daily", storeId, format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("store_daily_stats")
        .select("*")
        .eq("store_id", storeId)
        .gte("day", format(range.from, "yyyy-MM-dd"))
        .lte("day", format(range.to, "yyyy-MM-dd"))
        .order("day", { ascending: true });

      if (error) throw error;
      return (data || []) as Array<{
        store_id: string;
        day: string;
        page_views: number;
        product_views: number;
        add_to_carts: number;
        orders: number;
        unique_visitors: number;
        searches: number;
      }>;
    },
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

/** Product performance for a store */
export function useProductPerformance(storeId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", "products", storeId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("product_performance")
        .select("*")
        .eq("store_id", storeId)
        .order("views", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as Array<{
        product_id: string;
        product_name: string;
        store_id: string;
        price: number;
        views: number;
        add_to_carts: number;
        sales: number;
        conversion_rate: number;
      }>;
    },
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

/** KPI totals for a store in a date range */
export function useStoreKPIs(storeId: string | undefined, range: DateRange) {
  return useQuery({
    queryKey: ["analytics", "kpis", storeId, format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("event_type, user_id")
        .eq("store_id", storeId)
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (error) throw error;

      const events = data || [];
      const totalOrders = events.filter((e: any) => e.event_type === "order_created").length;
      const totalViews = events.filter((e: any) => e.event_type === "page_view" || e.event_type === "product_view").length;
      const uniqueUsers = new Set(events.map((e: any) => e.user_id)).size;
      const conversion = totalViews > 0 ? ((totalOrders / totalViews) * 100) : 0;

      return {
        totalOrders,
        totalViews,
        uniqueUsers,
        conversionRate: Math.round(conversion * 10) / 10,
      };
    },
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

/** Peak hours analysis - top 5 hours with most orders */
export function usePeakHours(storeId: string | undefined, range: DateRange) {
  return useQuery({
    queryKey: ["analytics", "peak-hours", storeId, format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("analytics_events")
        .select("created_at")
        .eq("store_id", storeId)
        .eq("event_type", "order_created")
        .gte("created_at", range.from.toISOString())
        .lte("created_at", range.to.toISOString());

      if (error) throw error;

      // Count orders per hour
      const hourCounts: Record<number, number> = {};
      (data || []).forEach((e: any) => {
        const hour = new Date(e.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      return Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          label: `${hour.padStart(2, "0")}:00`,
          orders: count as number,
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);
    },
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

/** Helper to create common date ranges */
export function getDateRange(days: number): DateRange {
  return {
    from: subDays(new Date(), days),
    to: new Date(),
  };
}
