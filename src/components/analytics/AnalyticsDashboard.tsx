/**
 * AnalyticsDashboard
 * 
 * Full analytics dashboard for store owners.
 * Includes KPIs, daily chart, product table, and peak hours.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Eye, Users, TrendingUp, Clock, BarChart3 } from "lucide-react";
import { useStoreDailyStats, useProductPerformance, useStoreKPIs, usePeakHours, getDateRange } from "@/hooks/useAnalyticsData";
import type { DateRange } from "@/hooks/useAnalyticsData";
import DailyChart from "./DailyChart";
import ProductTable from "./ProductTable";
import PeakHoursChart from "./PeakHoursChart";
import PeriodSelector from "./PeriodSelector";

interface AnalyticsDashboardProps {
  storeId: string;
  storeName?: string;
}

export default function AnalyticsDashboard({ storeId, storeName }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<DateRange>(getDateRange(30));
  const [periodLabel, setPeriodLabel] = useState("30d");

  const { data: kpis, isLoading: kpisLoading } = useStoreKPIs(storeId, range);
  const { data: dailyStats, isLoading: dailyLoading } = useStoreDailyStats(storeId, range);
  const { data: products, isLoading: productsLoading } = useProductPerformance(storeId);
  const { data: peakHours, isLoading: peakLoading } = usePeakHours(storeId, range);

  const handlePeriodChange = (days: number, label: string) => {
    setRange(getDateRange(days));
    setPeriodLabel(label);
  };

  const handleCustomRange = (from: Date, to: Date) => {
    setRange({ from, to });
    setPeriodLabel("custom");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            Analytics {storeName && <span className="text-muted-foreground font-normal">— {storeName}</span>}
          </h2>
        </div>
        <PeriodSelector
          currentLabel={periodLabel}
          onPeriodChange={handlePeriodChange}
          onCustomRange={handleCustomRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="Pedidos"
          value={kpis?.totalOrders}
          icon={<ShoppingBag className="h-4 w-4" />}
          loading={kpisLoading}
          color="text-primary"
        />
        <KpiCard
          title="Visualizações"
          value={kpis?.totalViews}
          icon={<Eye className="h-4 w-4" />}
          loading={kpisLoading}
          color="text-accent"
        />
        <KpiCard
          title="Clientes Únicos"
          value={kpis?.uniqueUsers}
          icon={<Users className="h-4 w-4" />}
          loading={kpisLoading}
          color="text-[hsl(var(--success))]"
        />
        <KpiCard
          title="Conversão"
          value={kpis?.conversionRate !== undefined ? `${kpis.conversionRate}%` : undefined}
          icon={<TrendingUp className="h-4 w-4" />}
          loading={kpisLoading}
          color="text-destructive"
        />
      </div>

      {/* Tabs: Chart / Products / Peak Hours */}
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Desempenho Diário</TabsTrigger>
          <TabsTrigger value="products">Top Produtos</TabsTrigger>
          <TabsTrigger value="peak">Horários de Pico</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visualizações vs Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <DailyChart data={dailyStats || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 20 Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <ProductTable products={products || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Horários de Pico — Top 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              {peakLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <PeakHoursChart data={peakHours || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  icon,
  loading,
  color,
}: {
  title: string;
  value?: number | string;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-1 h-6 w-16" />
          ) : (
            <p className="text-xl font-bold text-foreground">{value ?? 0}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
