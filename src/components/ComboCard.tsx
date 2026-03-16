import { Flame, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Combo } from "@/data/mockData";

interface ComboCardProps {
  combo: Combo;
  onAdd?: () => void;
}

const ComboCard = ({ combo, onAdd }: ComboCardProps) => {
  const desconto = Math.round(((combo.precoOriginal - combo.precoCombo) / combo.precoOriginal) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:shadow-lg group">
      {/* Discount badge */}
      <Badge className="absolute right-3 top-3 bg-destructive text-destructive-foreground border-0 gap-1">
        <Flame className="h-3 w-3" />
        -{desconto}%
      </Badge>

      <div className="space-y-3">
        <div>
          <h4 className="font-bold text-card-foreground text-lg">{combo.nome}</h4>
          <p className="text-sm text-muted-foreground mt-1">{combo.descricao}</p>
        </div>

        {/* Items */}
        <div className="space-y-1">
          {combo.itens.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              R$ {combo.precoCombo.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              R$ {combo.precoOriginal.toFixed(2).replace(".", ",")}
            </span>
          </div>
          {onAdd && (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
              Pedir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComboCard;
