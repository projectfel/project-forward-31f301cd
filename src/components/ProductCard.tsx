import { memo, useState } from "react";
import { Plus, Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import type { Tables } from "@/integrations/supabase/types";

interface ProductCardProps {
  product: Tables<"products"> & { categories?: { name: string; icon: string | null } | null };
  storeId: string;
  storeName: string;
  storeWhatsapp: string;
}

const ProductCard = memo(({ product, storeId, storeName, storeWhatsapp }: ProductCardProps) => {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.id === product.id && i.marketId === storeId);
  const quantity = cartItem?.quantidade || 0;

  const handleAdd = () => {
    const cartProduct = {
      id: product.id,
      nome: product.name,
      preco: Number(product.price),
      categoria: product.categories?.name || "",
      precoOriginal: product.original_price ? Number(product.original_price) : undefined,
      unidade: product.unit || undefined,
      destaque: product.featured || false,
      imagem: product.image_url || undefined,
    };
    addItem(cartProduct, storeId, storeName, storeWhatsapp);
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price);
  const desconto = hasDiscount
    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
    : 0;

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all duration-200 hover:shadow-md">
      {hasDiscount && (
        <Badge className="absolute -right-1 -top-2 bg-destructive text-destructive-foreground border-0 text-[10px] px-2">
          -{desconto}%
        </Badge>
      )}
      {product.featured && !hasDiscount && (
        <Badge className="absolute -right-1 -top-2 bg-accent text-accent-foreground border-0 text-[10px] px-2">
          ⭐ Destaque
        </Badge>
      )}

      {product.image_url && (
        <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-xl object-cover shrink-0" loading="lazy" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {product.categories?.name || ""}
        </p>
        <h4 className="mt-0.5 font-semibold text-card-foreground truncate">{product.name}</h4>
        {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            R$ {Number(product.price).toFixed(2).replace(".", ",")}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              R$ {Number(product.original_price).toFixed(2).replace(".", ",")}
            </span>
          )}
        </div>
      </div>

      {quantity > 0 ? (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (quantity <= 1) removeItem(product.id, storeId);
              else updateQuantity(product.id, storeId, quantity - 1);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-card-foreground">{quantity}</span>
          <button onClick={handleAdd} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAdd}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
            added ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] scale-110" : "bg-primary text-primary-foreground hover:shadow-md active:scale-95"
          }`}
        >
          {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
