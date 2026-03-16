/**
 * PeakHoursChart
 * Bar chart showing top 5 hours with most orders.
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PeakHourData {
  hour: number;
  label: string;
  orders: number;
}

interface PeakHoursChartProps {
  data: PeakHourData[];
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        <p>Nenhum pedido registrado no período</p>
      </div>
    );
  }

  // Sort by hour for display
  const sorted = [...data].sort((a, b) => a.hour - b.hour);
  const maxOrders = Math.max(...data.map((d) => d.orders));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={sorted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--card-foreground))",
          }}
          formatter={(value: number) => [`${value} pedidos`, "Pedidos"]}
        />
        <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
          {sorted.map((entry) => (
            <Cell
              key={entry.hour}
              fill={
                entry.orders === maxOrders
                  ? "hsl(var(--primary))"
                  : "hsl(var(--accent))"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
