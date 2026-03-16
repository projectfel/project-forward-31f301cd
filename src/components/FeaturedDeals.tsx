import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ComboCard from "./ComboCard";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedDeals = () => {
  const { data: combos, isLoading } = useQuery({
    queryKey: ["combos", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("combos")
        .select("*, stores(name)")
        .eq("active", true)
        .limit(6);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 mt-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </section>
    );
  }

  if (!combos || combos.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 mt-12">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <Flame className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Combos da Semana</h2>
            <p className="text-xs text-muted-foreground">Ofertas especiais dos mercados do bairro</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((combo) => (
          <ComboCard
            key={combo.id}
            combo={{
              id: combo.id,
              nome: combo.name,
              descricao: combo.description || "",
              precoCombo: Number(combo.combo_price),
              precoOriginal: Number(combo.original_price ?? combo.combo_price),
              itens: [],
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedDeals;
