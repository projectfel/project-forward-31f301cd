import { Star, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Supermarket } from "@/data/mockData";

interface MarketCardProps {
  market: Supermarket;
}

const MarketCard = ({ market }: MarketCardProps) => {
  return (
    <Link
      to={`/mercado/${market.id}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={market.imagem}
          alt={market.nome}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-background">{market.nome}</h3>
        </div>
        {market.aberto ? (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Aberto
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            Fechado
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {market.avaliacao}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {market.distancia}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {market.horario}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {market.categorias.slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MarketCard;
