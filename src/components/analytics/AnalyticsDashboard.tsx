/**
 * AnalyticsDashboard - Simplified for store owners
 * 
 * Shows key metrics in a clean, non-technical layout
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Eye, Users, TrendingUp } from "lucide-react";
import { useStoreKPIs, useStoreDailyStats, getDateRange } from "@/hooks/useAnalyticsData";
import type { DateRange } from "@/hooks/useAnalyticsData";
import DailyChart from "./DailyChart";

interface AnalyticsDashboardProps {
  storeId: string;
  storeName?: string;
}

export default function AnalyticsDashboard({ storeId, storeName }: AnalyticsDashboardProps) {
  const [days, setDays] = useState(30);
  const [range, setRange] = useState<DateRange>(getDateRange(30));

  const { data: kpis, isLoading: kpisLoading } = useStoreKPIs(storeId, range);
  const { data: dailyStats, isLoading: dailyLoading } = useStoreDailyStats(storeId, range);

  const handlePeriodChange = (d: number) => {
    setDays(d);
    setRange(getDateRange(d));
  };

  return (
    <div className="space-y-6">
      {/* Period selector - simplified */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período:</span>
        {[
          { d: 7, label: "7 dias" },
          { d: 30, label: "30 dias" },
          { d: 90, label: "3 meses" },
        ].map((opt) => (
          <button
            key={opt.d}
            onClick={() => handlePeriodChange(opt.d)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              days === opt.d
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPI Cards - clean and simple */}
      <div className="grid grid-cols-2 gap-3">
        <SimpleKpi
          label="Pedidos"
          value={kpis?.totalOrders}
          icon={<ShoppingBag className="h-5 w-5" />}
          loading={kpisLoading}
          color="bg-primary/10 text-primary"
        />
        <SimpleKpi
          label="Visualizações"
          value={kpis?.totalViews}
          icon={<Eye className="h-5 w-5" />}
          loading={kpisLoading}
          color="bg-accent/10 text-accent"
        />
        <SimpleKpi
          label="Clientes"
          value={kpis?.uniqueUsers}
          icon={<Users className="h-5 w-5" />}
          loading={kpisLoading}
          color="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
        />
        <SimpleKpi
          label="Conversão"
          value={kpis?.conversionRate !== undefined ? `${kpis.conversionRate}%` : undefined}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={kpisLoading}
          color="bg-destructive/10 text-destructive"
          hint="De quem viu para quem comprou"
        />
      </div>

      {/* Simple chart */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-foreground mb-3">Desempenho dos últimos {days} dias</p>
          {dailyLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <DailyChart data={dailyStats || []} />
          )}
        </CardContent>
      </Card>

      {/* Helpful tips */}
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground mb-2">💡 Dicas para vender mais</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Mantenha seus produtos com fotos atualizadas</li>
          <li>• Coloque promoções em destaque com o botão ⭐</li>
          <li>• Defina horários de funcionamento para aparecer como "Aberto"</li>
          <li>• Responda pedidos rapidamente pelo WhatsApp</li>
        </ul>
      </div>
    </div>
  );
}

function SimpleKpi({
  label,
  value,
  icon,
  loading,
  color,
  hint,
}: {
  label: string;
  value?: number | string;
  icon: React.ReactNode;
  loading: boolean;
  color: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-7 w-12 mb-1" />
          ) : (
            <p className="text-xl font-bold text-foreground">{value ?? 0}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
          {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
