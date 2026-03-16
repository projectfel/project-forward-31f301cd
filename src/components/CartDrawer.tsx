import { X, Minus, Plus, MessageCircle, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

const CartDrawer = () => {
  const { items, total, isOpen, setIsOpen, updateQuantity, removeItem, clearCart } = useCart();
  const [copied, setCopied] = useState(false);

  const buildMessage = () => {
    if (items.length === 0) return "";

    const byMarket = items.reduce((acc, item) => {
      if (!acc[item.marketId]) {
        acc[item.marketId] = { nome: item.marketNome, whatsapp: item.marketWhatsapp, items: [] };
      }
      acc[item.marketId].items.push(item);
      return acc;
    }, {} as Record<string, { nome: string; whatsapp: string; items: typeof items }>);

    const firstMarket = Object.values(byMarket)[0];
    const itens = firstMarket.items
      .map((p) => `• ${p.nome} x${p.quantidade} (R$ ${(p.preco * p.quantidade).toFixed(2).replace(".", ",")})`)
      .join("\n");
    const totalStr = total.toFixed(2).replace(".", ",");

    return `Olá ${firstMarket.nome}! 🛒\n\nGostaria de fazer este pedido:\n\n${itens}\n\n💰 Total: R$ ${totalStr}\n\n📍 Endereço: [Digite seu endereço]\n\nObrigado!`;
  };

  const getWhatsappNumber = () => {
    if (items.length === 0) return "";
    return items[0].marketWhatsapp;
  };

  const finalizarPedido = () => {
    if (items.length === 0) return;

    const msg = buildMessage();
    const whatsapp = getWhatsappNumber();
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`;

    // Try to open WhatsApp - may be blocked in iframe/preview
    const newWindow = window.open(url, "_blank");

    if (!newWindow || newWindow.closed) {
      // Fallback: copy message and show instructions
      navigator.clipboard.writeText(msg).then(() => {
        toast.success("Mensagem copiada! Cole no WhatsApp do mercado.", {
          description: `WhatsApp: ${whatsapp}`,
          duration: 8000,
        });
      }).catch(() => {
        toast.info(`Envie a mensagem para o WhatsApp: ${whatsapp}`, { duration: 8000 });
      });
    }
  };

  const copyMessage = async () => {
    const msg = buildMessage();
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-foreground">Seu Carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="text-5xl">🛒</div>
            <p className="text-lg font-medium">Carrinho vazio</p>
            <p className="text-sm">Adicione produtos para começar</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div
                  key={`${item.marketId}-${item.id}`}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{item.marketNome}</p>
                    <p className="font-medium text-card-foreground truncate">{item.nome}</p>
                    <p className="text-sm font-bold text-primary">
                      R$ {(item.preco * item.quantidade).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.marketId, item.quantidade - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-foreground">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.marketId, item.quantidade + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id, item.marketId)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
              <button
                onClick={finalizarPedido}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--whatsapp))] py-4 text-[hsl(var(--whatsapp-foreground))] font-bold text-lg transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                Finalizar via WhatsApp
              </button>
              <button
                onClick={copyMessage}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-[hsl(var(--success))]" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar mensagem"}
              </button>
              <button
                onClick={clearCart}
                className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                Limpar carrinho
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
