/**
 * Analytics Service
 * 
 * Batch-processes analytics events (max 10 events or 5s interval).
 * Falls back to direct Supabase insert if edge function fails.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────
export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "order_created"
  | "search";

interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  store_id?: string;
  product_id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

// ─── Batch Queue ─────────────────────────────────────────────
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5_000;

let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  if (queue.length === 0) return;

  const batch = [...queue];
  queue = [];

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  try {
    // Try edge function first
    const { error } = await supabase.functions.invoke("track-analytics", {
      body: { events: batch },
    });

    if (error) throw error;
  } catch (err) {
    console.warn("[Analytics] Edge function failed, using direct insert:", err);
    await fallbackInsert(batch);
  }
}

async function fallbackInsert(events: AnalyticsEvent[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = events.map((e) => ({
      event_type: e.event_type,
      user_id: user.id,
      store_id: e.store_id || null,
      product_id: e.product_id || null,
      metadata: e.metadata || {},
      created_at: e.timestamp || new Date().toISOString(),
    }));

    await (supabase as any).from("analytics_events").insert(rows);
  } catch (fallbackErr) {
    console.error("[Analytics] Fallback insert failed:", fallbackErr);
  }
}

function enqueue(event: AnalyticsEvent) {
  queue.push({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });

  if (queue.length >= BATCH_SIZE) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
  }
}

// ─── Public API ──────────────────────────────────────────────

/** Track a page view */
export function trackPageView(metadata?: Record<string, unknown>) {
  enqueue({ event_type: "page_view", metadata });
}

/** Track a product view */
export function trackProductView(
  storeId: string,
  productId: string,
  metadata?: Record<string, unknown>
) {
  enqueue({
    event_type: "product_view",
    store_id: storeId,
    product_id: productId,
    metadata,
  });
}

/** Track add to cart */
export function trackAddToCart(
  storeId: string,
  productId: string,
  metadata?: Record<string, unknown>
) {
  enqueue({
    event_type: "add_to_cart",
    store_id: storeId,
    product_id: productId,
    metadata,
  });
}

/** Track order created */
export function trackOrderCreated(
  storeId: string,
  metadata?: Record<string, unknown>
) {
  enqueue({
    event_type: "order_created",
    store_id: storeId,
    metadata,
  });
}

/** Track search */
export function trackSearch(
  query: string,
  storeId?: string,
  metadata?: Record<string, unknown>
) {
  enqueue({
    event_type: "search",
    store_id: storeId,
    metadata: { query, ...metadata },
  });
}

/** Force flush pending events (e.g., on page unload) */
export function flushAnalytics() {
  flush();
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => flush());
}
