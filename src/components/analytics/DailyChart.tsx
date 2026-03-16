/**
 * DailyChart
 * Line chart showing daily views vs orders over time.
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyData {
  day: string;
  page_views: number;
  product_views: number;
  orders: number;
  unique_visitors: number;
}

interface DailyChartProps {
  data: DailyData[];
}

export default function DailyChart({ data }: DailyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        <p>Nenhum dado disponível para o período selecionado</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    dayLabel: format(parseISO(d.day), "dd/MM", { locale: ptBR }),
    views: (d.page_views || 0) + (d.product_views || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="dayLabel"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--card-foreground))",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          name="Visualizações"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="orders"
          name="Pedidos"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="unique_visitors"
          name="Visitantes Únicos"
          stroke="hsl(var(--success))"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
