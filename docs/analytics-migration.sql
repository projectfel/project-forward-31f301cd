-- ============================================================
-- ANALYTICS MIGRATION
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Create indexes for performance
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_store_id ON public.analytics_events(store_id);
CREATE INDEX idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_analytics_user_store ON public.analytics_events(user_id, store_id);

-- 3. Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Admin can see everything
CREATE POLICY "admin_read_all_analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Store owner can see their store's analytics
CREATE POLICY "owner_read_store_analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (
    store_id IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- Authenticated users can insert their own events
CREATE POLICY "service_insert_analytics"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. View: store_daily_stats
CREATE OR REPLACE VIEW public.store_daily_stats AS
SELECT
  store_id,
  date_trunc('day', created_at)::date AS day,
  COUNT(*) FILTER (WHERE event_type = 'page_view') AS page_views,
  COUNT(*) FILTER (WHERE event_type = 'product_view') AS product_views,
  COUNT(*) FILTER (WHERE event_type = 'add_to_cart') AS add_to_carts,
  COUNT(*) FILTER (WHERE event_type = 'order_created') AS orders,
  COUNT(DISTINCT user_id) AS unique_visitors,
  COUNT(*) FILTER (WHERE event_type = 'search') AS searches
FROM public.analytics_events
WHERE store_id IS NOT NULL
GROUP BY store_id, date_trunc('day', created_at)::date;

-- 6. View: product_performance
CREATE OR REPLACE VIEW public.product_performance AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.store_id,
  p.price,
  COUNT(*) FILTER (WHERE ae.event_type = 'product_view') AS views,
  COUNT(*) FILTER (WHERE ae.event_type = 'add_to_cart') AS add_to_carts,
  COUNT(*) FILTER (WHERE ae.event_type = 'order_created') AS sales,
  CASE 
    WHEN COUNT(*) FILTER (WHERE ae.event_type = 'product_view') > 0 
    THEN ROUND(
      (COUNT(*) FILTER (WHERE ae.event_type = 'order_created')::numeric / 
       COUNT(*) FILTER (WHERE ae.event_type = 'product_view')::numeric) * 100, 1
    )
    ELSE 0 
  END AS conversion_rate
FROM public.products p
LEFT JOIN public.analytics_events ae ON ae.product_id = p.id
GROUP BY p.id, p.name, p.store_id, p.price;
