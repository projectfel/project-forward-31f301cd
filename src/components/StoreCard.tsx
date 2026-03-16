import { memo } from "react";
import { Star, Clock, MapPin, Truck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getStoreStatusLabel } from "@/lib/storeStatus";
import type { Tables } from "@/integrations/supabase/types";

interface StoreCardProps {
  store: Tables<"stores">;
}

const StoreCard = memo(({ store }: StoreCardProps) => {
  const { label, isOpen } = getStoreStatusLabel(store);

  return (
    <Link
      to={`/mercado/${store.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {store.cover_image ? (
          <img src={store.cover_image} alt={store.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-secondary flex items-center justify-center">
            <span className="text-4xl">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {isOpen ? (
          <Badge className="absolute left-3 top-3 bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-0 gap-1">
            <Zap className="h-3 w-3" />
            Aberto
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute left-3 top-3 gap-1 opacity-90">
            <Clock className="h-3 w-3" />
            {label}
          </Badge>
        )}

        <div className="absolute right-3 top-3 rounded-lg bg-card/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-card-foreground">
          {store.delivery_time_min ?? 30}-{store.delivery_time_max ?? 60} min
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-primary-foreground drop-shadow-md">{store.name}</h3>
          {store.description && <p className="text-xs text-primary-foreground/80 mt-0.5 line-clamp-1">{store.description}</p>}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-medium text-card-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {store.rating ?? 0}
            <span className="text-muted-foreground font-normal">({store.total_ratings ?? 0})</span>
          </span>
          {store.neighborhood && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {store.neighborhood}
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            {(store.delivery_fee ?? 0) === 0 ? (
              <span className="text-[hsl(var(--success))] font-medium">Grátis</span>
            ) : (
              `R$ ${Number(store.delivery_fee).toFixed(2).replace(".", ",")}`
            )}
          </span>
        </div>
      </div>
    </Link>
  );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
