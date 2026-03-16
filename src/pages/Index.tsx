import { useState, useMemo } from "react";
import { useStores } from "@/hooks/useStores";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { isStoreOpen } from "@/lib/storeStatus";
import HeroSection from "@/components/HeroSection";
import StoreCard from "@/components/StoreCard";
import FeaturedDeals from "@/components/FeaturedDeals";
import GlobalSearch from "@/components/GlobalSearch";
import { StoreCardSkeleton } from "@/components/StoreSkeleton";
import { Store, TrendingUp } from "lucide-react";

const Index = () => {
  const [busca, setBusca] = useState("");
  const { data: stores, isLoading } = useStores();
  const { data: featuredProducts } = useFeaturedProducts();

  const filtered = useMemo(() => {
    if (!stores) return [];
    return stores.filter((s) => {
      const matchBusca =
        !busca || s.name.toLowerCase().includes(busca.toLowerCase()) || (s.description || "").toLowerCase().includes(busca.toLowerCase());
      return matchBusca;
    });
  }, [stores, busca]);

  // Apenas mercados ativos (não desativados/manutenção) aparecem na página inicial
  const ativos = filtered.filter((s) => s.status !== "maintenance");

  const abertos = ativos.filter((s) => isStoreOpen(s));
  const fechados = ativos.filter((s) => !isStoreOpen(s));

  return (
    <main className="pb-8">
      <HeroSection busca={busca} onBuscaChange={setBusca} />

      <div className="mx-auto max-w-lg px-4 relative -mt-2 z-20">
        <GlobalSearch busca={busca} onBuscaChange={setBusca} />
      </div>

      <FeaturedDeals />

      {/* Featured products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-12">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Ofertas em Destaque</h2>
              <p className="text-xs text-muted-foreground">Os melhores preços do bairro</p>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-card p-4 transition-all hover:shadow-md">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {(p as any).stores?.name || ""}
                </span>
                <h4 className="mt-1 font-semibold text-card-foreground text-sm truncate">{p.name}</h4>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    R$ {Number(p.price).toFixed(2).replace(".", ",")}
                  </span>
                  {p.original_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {Number(p.original_price).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Store listings */}
      <section className="mx-auto max-w-6xl px-4 mt-12">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <StoreCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {abertos.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
                    <Store className="h-4 w-4 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Abertos agora <span className="text-primary">({abertos.length})</span>
                    </h2>
                    <p className="text-xs text-muted-foreground">Peça agora e receba em minutos</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {abertos.map((s) => <StoreCard key={s.id} store={s} />)}
                </div>
              </>
            )}

            {fechados.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-5 mt-12">
                  <h2 className="text-lg font-semibold text-muted-foreground">Fechados no momento</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
                  {fechados.map((s) => <StoreCard key={s.id} store={s} />)}
                </div>
              </>
            )}

            {filtered.length === 0 && !isLoading && (
              <div className="py-20 text-center text-muted-foreground">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-medium">Nenhum mercado encontrado</p>
                <p className="text-sm mt-1">Tente buscar por outro nome</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default Index;
