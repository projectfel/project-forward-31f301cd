import { useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useStores } from "@/hooks/useStores";
import { isStoreOpen } from "@/lib/storeStatus";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Mic, MicOff, ArrowLeft, Loader2, Pencil, Trash2, Plus,
  ShoppingCart, TrendingDown, Store, AlertCircle, ChevronDown, ChevronUp,
  BarChart3, ShoppingBag, Sparkles, Volume2, Keyboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ParsedItem {
  name: string;
  quantity: number;
  unit?: string | null;
  original: string;
  confidence: boolean;
}

interface StoreMatch {
  storeId: string;
  storeName: string;
  storeWhatsapp: string;
  productId: string;
  productName: string;
  price: number;
  unit: string | null;
}

interface ComparisonResult {
  itemName: string;
  quantity: number;
  matches: StoreMatch[];
  bestPrice: number | null;
  notFound: boolean;
}

interface BestCart {
  storeId: string;
  storeName: string;
  storeWhatsapp: string;
  total: number;
  items: { name: string; price: number; quantity: number; productId: string }[];
  missingItems: string[];
}

type ViewMode = "per-item" | "best-cart";
type InputMode = "voice" | "text";

const CompraVoz = () => {
  const voice = useVoiceRecognition();
  const { data: stores } = useStores();
  const { addItem } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [parsing, setParsing] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult[] | null>(null);
  const [bestCarts, setBestCarts] = useState<BestCart[] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("best-cart");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("voice");

  const parseTranscript = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast.error("Nenhum texto para interpretar");
      return;
    }
    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-voice-list", {
        body: { transcript: text },
      });
      if (error) throw error;
      if (data?.items && data.items.length > 0) {
        setParsedItems(data.items);
        setComparison(null);
        setBestCarts(null);
        toast.success(`${data.items.length} ${data.items.length === 1 ? "item identificado" : "itens identificados"}!`);
      } else {
        toast.error("Não consegui identificar itens na lista. Tente ser mais específico.");
      }
    } catch (err: any) {
      if (err?.message?.includes("429")) {
        toast.error("Muitas requisições. Aguarde alguns segundos.");
      } else {
        toast.error("Erro ao interpretar lista. Tente novamente.");
      }
    } finally {
      setParsing(false);
    }
  }, []);

  const handleVoiceToggle = useCallback(() => {
    if (voice.isListening) {
      voice.stop();
    } else {
      voice.start((finalTranscript) => {
        if (finalTranscript) {
          parseTranscript(finalTranscript);
        }
      });
    }
  }, [voice, parseTranscript]);

  const removeItem = (idx: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== idx));
    setComparison(null);
    setBestCarts(null);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(parsedItems[idx].name);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    setParsedItems((prev) =>
      prev.map((item, i) => (i === editingIdx ? { ...item, name: editValue, confidence: true } : item))
    );
    setEditingIdx(null);
    setComparison(null);
    setBestCarts(null);
  };

  const updateQuantity = (idx: number, delta: number) => {
    setParsedItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
    setComparison(null);
    setBestCarts(null);
  };

  const addManualItem = () => {
    if (!manualInput.trim()) return;
    setParsedItems((prev) => [
      ...prev,
      { name: manualInput.trim(), quantity: 1, unit: null, original: manualInput.trim(), confidence: true },
    ]);
    setManualInput("");
    setComparison(null);
    setBestCarts(null);
  };

  const comparePrices = useCallback(async () => {
    if (parsedItems.length === 0 || !stores) return;
    setComparing(true);

    try {
      const { data: allProducts, error } = await supabase
        .from("products")
        .select("id, name, price, unit, store_id, in_stock")
        .eq("in_stock", true);

      if (error) throw error;

      const storeMap = new Map(stores.map((s) => [s.id, s]));

      const results: ComparisonResult[] = parsedItems.map((item) => {
        const searchTerms = item.name.toLowerCase().split(" ").filter((t) => t.length >= 2);

        const matches: StoreMatch[] = (allProducts || [])
          .filter((p) => {
            const pName = p.name.toLowerCase();
            return searchTerms.some((term) => pName.includes(term));
          })
          .map((p) => {
            const store = storeMap.get(p.store_id);
            return {
              storeId: p.store_id,
              storeName: store?.name || "Loja",
              storeWhatsapp: store?.whatsapp || "",
              productId: p.id,
              productName: p.name,
              price: Number(p.price),
              unit: p.unit,
            };
          })
          .sort((a, b) => a.price - b.price);

        return {
          itemName: item.name,
          quantity: item.quantity,
          matches,
          bestPrice: matches.length > 0 ? matches[0].price : null,
          notFound: matches.length === 0,
        };
      });

      setComparison(results);

      const carts: BestCart[] = stores
        .filter((s) => isStoreOpen(s) || s.status !== "maintenance")
        .map((store) => {
          const storeProducts = (allProducts || []).filter((p) => p.store_id === store.id);
          const cartItems: BestCart["items"] = [];
          const missingItems: string[] = [];

          parsedItems.forEach((item) => {
            const searchTerms = item.name.toLowerCase().split(" ").filter((t) => t.length >= 2);
            const match = storeProducts
              .filter((p) => {
                const pName = p.name.toLowerCase();
                return searchTerms.some((term) => pName.includes(term));
              })
              .sort((a, b) => Number(a.price) - Number(b.price))[0];

            if (match) {
              cartItems.push({
                name: match.name,
                price: Number(match.price),
                quantity: item.quantity,
                productId: match.id,
              });
            } else {
              missingItems.push(item.name);
            }
          });

          return {
            storeId: store.id,
            storeName: store.name,
            storeWhatsapp: store.whatsapp,
            total: cartItems.reduce((sum, ci) => sum + ci.price * ci.quantity, 0),
            items: cartItems,
            missingItems,
          };
        })
        .filter((c) => c.items.length > 0)
        .sort((a, b) => {
          if (a.missingItems.length !== b.missingItems.length) {
            return a.missingItems.length - b.missingItems.length;
          }
          return a.total - b.total;
        });

      setBestCarts(carts);
      setComparing(false);

      const notFoundCount = results.filter((r) => r.notFound).length;
      if (notFoundCount > 0) {
        toast.info(`${notFoundCount} ${notFoundCount === 1 ? "item" : "itens"} não encontrado(s) nas lojas cadastradas.`);
      } else {
        toast.success("Comparação concluída!");
      }
    } catch {
      toast.error("Erro ao comparar preços");
      setComparing(false);
    }
  }, [parsedItems, stores]);

  const addToCartFromBestCart = (cart: BestCart) => {
    cart.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem(
          { id: item.productId, nome: item.name, preco: item.price, categoria: "", unidade: "", destaque: false },
          cart.storeId,
          cart.storeName,
          cart.storeWhatsapp
        );
      }
    });
    toast.success(`${cart.items.length} itens adicionados ao carrinho de ${cart.storeName}!`);
  };

  const addSingleToCart = (match: StoreMatch, quantity: number) => {
    for (let i = 0; i < quantity; i++) {
      addItem(
        { id: match.productId, nome: match.productName, preco: match.price, categoria: "", unidade: match.unit || "", destaque: false },
        match.storeId,
        match.storeName,
        match.storeWhatsapp
      );
    }
    toast.success(`${match.productName} adicionado!`);
  };

  const clearAll = () => {
    voice.reset();
    setParsedItems([]);
    setComparison(null);
    setBestCarts(null);
    setManualInput("");
  };

  const savings = bestCarts && bestCarts.length >= 2
    ? bestCarts[bestCarts.length - 1].total - bestCarts[0].total
    : null;

  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: "/compra-voz" } }} replace />;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
      <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      {/* Hero header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Lista Inteligente</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          Fale ou digite sua lista e descubra onde comprar mais barato no bairro
        </p>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setInputMode("voice")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
            inputMode === "voice"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-card-foreground border hover:bg-secondary"
          }`}
        >
          <Volume2 className="h-4 w-4" />
          Por voz
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
            inputMode === "text"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card text-card-foreground border hover:bg-secondary"
          }`}
        >
          <Keyboard className="h-4 w-4" />
          Digitar
        </button>
      </div>

      {/* Voice input */}
      {inputMode === "voice" && (
        <section className="mb-6 rounded-2xl border bg-card p-6">
          {!voice.isSupported ? (
            <div className="text-center text-muted-foreground py-4">
              <AlertCircle className="mx-auto h-10 w-10 mb-2 text-destructive" />
              <p className="font-medium">Navegador não suporta voz</p>
              <p className="text-sm mt-1">Use Chrome ou Edge, ou mude para o modo "Digitar"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Mic button with pulse animation */}
              <div className="relative">
                {voice.isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
                    <div className="absolute -inset-2 rounded-full bg-destructive/10 animate-pulse" />
                  </>
                )}
                <button
                  onClick={handleVoiceToggle}
                  className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                    voice.isListening
                      ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 scale-110"
                      : "bg-primary text-primary-foreground hover:shadow-xl hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                  }`}
                >
                  {voice.isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {voice.isListening ? "🔴 Ouvindo... Toque para parar" : "Toque para falar sua lista"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {voice.isListening
                    ? 'Ex: "2 leites, 1 arroz, 3 feijão"'
                    : "Diga os itens e a quantidade naturalmente"}
                </p>
              </div>

              {/* Live transcript */}
              {(voice.transcript || voice.interimTranscript) && (
                <div className="w-full rounded-xl bg-secondary/70 p-4 border border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Transcrição</p>
                  <p className="text-foreground leading-relaxed">
                    {voice.transcript}
                    {voice.interimTranscript && (
                      <span className="text-muted-foreground italic"> {voice.interimTranscript}</span>
                    )}
                  </p>
                </div>
              )}

              {voice.error && (
                <div className="w-full rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {voice.error}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Text input */}
      {inputMode === "text" && (
        <section className="mb-6 rounded-2xl border bg-card p-6">
          <p className="text-sm font-medium text-foreground mb-2">Digite sua lista de compras</p>
          <p className="text-xs text-muted-foreground mb-4">
            Escreva naturalmente, ex: "2 leites, 1 arroz, 3 feijão, café"
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && manualInput.trim()) parseTranscript(manualInput);
              }}
              placeholder="2 leites, 1 arroz, 3 feijão..."
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={() => { if (manualInput.trim()) parseTranscript(manualInput); }}
              disabled={parsing || !manualInput.trim()}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </div>
        </section>
      )}

      {/* Parsing indicator */}
      {parsing && (
        <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl bg-primary/5 border border-primary/10 p-5">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">Interpretando sua lista com IA...</span>
        </div>
      )}

      {/* Parsed items list */}
      {parsedItems.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">
              🛒 Sua Lista ({parsedItems.length} {parsedItems.length === 1 ? "item" : "itens"})
            </h2>
            <button onClick={clearAll} className="text-xs text-destructive hover:underline transition-colors">
              Limpar
            </button>
          </div>

          <div className="space-y-2">
            {parsedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-xl border bg-card p-3 transition-colors hover:bg-secondary/30">
                {editingIdx === idx ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      autoFocus
                      className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button onClick={saveEdit} className="text-xs text-primary font-semibold px-2">Salvar</button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-card-foreground text-sm">{item.name}</span>
                        {!item.confidence && (
                          <Badge variant="outline" className="text-[10px] text-accent border-accent/30 py-0">
                            Verificar
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="text-sm font-bold">−</span>
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => startEdit(idx)} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => removeItem(idx)} className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add more items inline */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={inputMode === "text" ? "" : manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addManualItem()}
              placeholder="Adicionar item..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={addManualItem} disabled={!manualInput.trim()} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Compare button */}
          <button
            onClick={comparePrices}
            disabled={comparing || parsedItems.length === 0}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            {comparing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Comparando preços...
              </>
            ) : (
              <>
                <BarChart3 className="h-5 w-5" />
                Comparar Preços nos Mercados
              </>
            )}
          </button>
        </section>
      )}

      {/* Comparison results */}
      {(comparison || bestCarts) && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold text-foreground">📊 Resultado da Comparação</h2>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode("best-cart")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all ${
                viewMode === "best-cart"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border hover:bg-secondary"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Melhor Carrinho
            </button>
            <button
              onClick={() => setViewMode("per-item")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all ${
                viewMode === "per-item"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border hover:bg-secondary"
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Por Item
            </button>
          </div>

          {/* Best Cart View */}
          {viewMode === "best-cart" && bestCarts && (
            <div className="space-y-3">
              {savings && savings > 0 && (
                <div className="rounded-2xl bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/20 p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--success))]/20">
                    <TrendingDown className="h-5 w-5 text-[hsl(var(--success))]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Economia de até R$ {savings.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-muted-foreground">Comprando no mercado mais barato</p>
                  </div>
                </div>
              )}

              {/* Ranking compacto dos mercados */}
              {bestCarts.length > 0 && (
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {bestCarts.slice(0, 3).map((cart, idx) => (
                    <div
                      key={cart.storeId}
                      className={`rounded-xl border bg-card px-3 py-2 text-xs ${
                        idx === 0 ? "border-primary/60 bg-primary/5" : "border-border/60"
                      }`}
                    >
                      <p className="font-semibold text-card-foreground truncate">
                        {idx + 1}º {idx === 0 && "mais barato"} {idx === 0 ? "" : "mais barato"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {cart.storeName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-primary">
                        R$ {cart.total.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {bestCarts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground rounded-2xl border bg-card">
                  <Store className="mx-auto h-10 w-10 mb-3 opacity-40" />
                  <p className="font-medium">Nenhuma loja encontrada com esses produtos</p>
                  <p className="text-sm mt-1">Tente editar os nomes dos itens para termos mais genéricos</p>
                </div>
              ) : (
                bestCarts.map((cart, idx) => (
                  <div
                    key={cart.storeId}
                    className={`rounded-2xl border bg-card p-4 transition-all ${
                      idx === 0 ? "ring-2 ring-primary/40 shadow-md" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <Badge className="bg-primary text-primary-foreground border-0 text-[10px]">🏆 Melhor</Badge>
                        )}
                        <h3 className="font-bold text-card-foreground text-sm">{cart.storeName}</h3>
                        <span className="text-[11px] text-muted-foreground">
                          {cart.items.length}/{parsedItems.length} itens encontrados
                        </span>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        R$ {cart.total.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {cart.items.map((ci) => (
                        <div key={ci.productId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {ci.name} ×{ci.quantity}
                          </span>
                          <span className="text-card-foreground font-medium">
                            R$ {(ci.price * ci.quantity).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {cart.missingItems.length > 0 && (
                      <div className="rounded-lg bg-accent/10 px-3 py-2 mb-3">
                        <p className="text-xs text-accent font-medium">
                          ⚠️ Não encontrado: {cart.missingItems.join(", ")}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => addToCartFromBestCart(cart)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary py-2.5 text-sm font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Adicionar ao carrinho
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Per-item View */}
          {viewMode === "per-item" && comparison && (
            <div className="space-y-2">
              {comparison.map((result, idx) => (
                <div key={idx} className="rounded-xl border bg-card overflow-hidden">
                  <button
                    onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-card-foreground text-sm">
                        {result.itemName} <span className="text-muted-foreground font-normal">×{result.quantity}</span>
                      </span>
                      {result.notFound ? (
                        <p className="text-xs text-destructive mt-0.5">Não encontrado</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {result.matches.length} {result.matches.length === 1 ? "loja" : "lojas"} • Menor: R$ {result.bestPrice!.toFixed(2).replace(".", ",")}
                        </p>
                      )}
                    </div>
                    {!result.notFound && (
                      expandedItem === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {expandedItem === idx && result.matches.length > 0 && (
                    <div className="border-t px-3 py-2 space-y-2">
                      {result.matches.map((match, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between py-1.5">
                          <div>
                            <p className="text-sm text-card-foreground">{match.storeName}</p>
                            <p className="text-xs text-muted-foreground">{match.productName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${mIdx === 0 ? "text-[hsl(var(--success))]" : "text-card-foreground"}`}>
                              R$ {match.price.toFixed(2).replace(".", ",")}
                            </span>
                            <button
                              onClick={() => addSingleToCart(match, result.quantity)}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state - How it works */}
      {parsedItems.length === 0 && !parsing && (
        <section className="rounded-2xl border bg-card p-6 text-center">
          <div className="mb-4">
            <ShoppingCart className="mx-auto h-10 w-10 text-primary/30" />
          </div>
          <p className="text-base font-bold text-foreground mb-4">Como funciona?</p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { step: "1", icon: "🎤", text: "Fale ou digite sua lista de compras" },
              { step: "2", icon: "🤖", text: "A IA organiza os itens automaticamente" },
              { step: "3", icon: "📊", text: "Compare preços entre os mercados" },
              { step: "4", icon: "🛒", text: "Adicione ao carrinho e finalize" },
            ].map(({ step, icon, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default CompraVoz;
