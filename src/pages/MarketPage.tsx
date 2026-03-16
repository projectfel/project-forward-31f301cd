import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, MapPin, Truck, Heart, Share2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/hooks/useStores";
import { useProducts } from "@/hooks/useProducts";
import { getStoreStatusLabel } from "@/lib/storeStatus";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/StoreSkeleton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MarketPage = () => {
  const { id } = useParams();
  const { data: store, isLoading: storeLoading } = useStore(id);
  const { data: products, isLoading: productsLoading } = useProducts(id);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  if (storeLoading) {
    return (
      <main className="pb-8">
        <Skeleton className="h-60 sm:h-80 w-full rounded-none" />
        <div className="mx-auto max-w-6xl px-4 mt-6 space-y-3">
          {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-xl font-bold text-foreground">Mercado não encontrado</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  const { label: statusLabel, isOpen } = getStoreStatusLabel(store);

  // Build categories from products
  const categories = [...new Set((products || []).map((p) => p.categories?.name).filter(Boolean))];
  const filteredProducts = categoriaAtiva
    ? (products || []).filter((p) => p.categories?.name === categoriaAtiva)
    : (products || []);

  return (
    <main className="pb-8">
      {/* Banner */}
      <div className="relative h-60 sm:h-80 overflow-hidden">
        {store.cover_image ? (
          <img src={store.cover_image} alt={store.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-secondary flex items-center justify-center">
            <span className="text-6xl">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-foreground/20" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-sm text-card-foreground hover:bg-card transition-colors shadow-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-sm text-card-foreground shadow-md">
              <Heart className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 backdrop-blur-sm text-card-foreground shadow-md">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-2">
              {isOpen ? (
                <Badge className="bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0">Aberto agora</Badge>
              ) : (
                <Badge variant="secondary">{statusLabel}</Badge>
              )}
              <Badge variant="outline" className="bg-card/50 backdrop-blur-sm border-border/50">
                {store.delivery_time_min ?? 30}-{store.delivery_time_max ?? 60} min
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{store.name}</h1>
            {store.description && <p className="text-sm text-muted-foreground mt-1">{store.description}</p>}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mx-auto max-w-6xl px-4 mt-4">
        <div className="flex items-center gap-5 text-sm overflow-x-auto pb-2">
          <span className="flex items-center gap-1 font-medium text-foreground shrink-0">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {store.rating ?? 0}
            <span className="text-muted-foreground font-normal">({store.total_ratings ?? 0})</span>
          </span>
          {store.address && (
            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
              <MapPin className="h-3.5 w-3.5" />
              {store.address}
            </span>
          )}
          {store.opens_at && store.closes_at && (
            <span className="flex items-center gap-1 text-muted-foreground shrink-0">
              <Clock className="h-3.5 w-3.5" />
              {store.opens_at} - {store.closes_at}
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground shrink-0">
            <Truck className="h-3.5 w-3.5" />
            Taxa: R$ {Number(store.delivery_fee ?? 0).toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Categories filter */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 mt-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategoriaAtiva(null)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${!categoriaAtiva ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-card-foreground border hover:bg-secondary"}`}
            >
              Todos ({(products || []).length})
            </button>
            {categories.map((cat) => {
              const count = (products || []).filter((p) => p.categories?.name === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat!)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${categoriaAtiva === cat ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-card-foreground border hover:bg-secondary"}`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 mt-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">
          {categoriaAtiva || "Todos os produtos"}{" "}
          <span className="text-muted-foreground font-normal text-base">({filteredProducts.length})</span>
        </h2>
        {productsLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-medium">Nenhum produto disponível</p>
            <p className="text-sm mt-1">Este mercado ainda não adicionou produtos</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                storeId={store.id}
                storeName={store.name}
                storeWhatsapp={store.whatsapp}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MarketPage;
