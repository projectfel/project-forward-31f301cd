import { useState } from "react";
import { Package, Store, Clock, Plus, Trash2, ArrowLeft, Pencil, Search, Image as ImageIcon, Save, X, ShoppingBag, Settings, Upload, BarChart3, Tag, Star, StarOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyStores } from "@/hooks/useStores";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useStoreOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useCategories } from "@/hooks/useCategories";
import { storesService } from "@/services/stores";
import { isStoreOpen, getStoreStatusLabel } from "@/lib/storeStatus";
import { DashboardSkeleton } from "@/components/StoreSkeleton";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: stores, isLoading: storesLoading } = useMyStores(user?.id);
  const store = stores?.[0];

  const { data: products, isLoading: productsLoading } = useProducts(store?.id);
  const { data: orders, isLoading: ordersLoading } = useStoreOrders(store?.id);
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const { upload, uploading } = useUploadImage();

  const [busca, setBusca] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state - added category_id, original_price, featured
  const [form, setForm] = useState({
    name: "", price: "", description: "", unit: "un", image_url: "",
    category_id: "", original_price: "", featured: false,
  });

  // Store settings
  const [showSettings, setShowSettings] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: "", description: "", address: "", phone: "", whatsapp: "",
    opens_at: "", closes_at: "", delivery_fee: "", min_order: "",
    delivery_time_min: "", delivery_time_max: "",
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", unit: "un", image_url: "", category_id: "", original_price: "", featured: false });
    setShowAdd(false);
    setEditingId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading("Enviando imagem...");
    try {
      const result = await upload(file, `products/${store?.id}`);
      setForm((f) => ({ ...f, image_url: result.url }));
      toast.success("Imagem carregada!", { id: toastId });
    } catch {
      toast.error("Erro ao carregar imagem", { id: toastId });
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !store) return;
    const toastId = toast.loading("Atualizando foto de capa...");
    try {
      const result = await upload(file, `covers/${store.id}`);
      await storesService.update(store.id, { cover_image: result.url });
      setCoverPreview(result.url);
      toast.success("Foto de capa atualizada!", { id: toastId });
    } catch {
      toast.error("Erro ao atualizar foto de capa", { id: toastId });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !store) return;
    const toastId = toast.loading(editingId ? "Atualizando produto..." : "Criando produto...");
    try {
      if (editingId) {
        await updateProduct.mutateAsync({
          id: editingId,
          updates: {
            name: form.name,
            price: parseFloat(form.price),
            description: form.description,
            unit: form.unit,
            image_url: form.image_url || null,
            category_id: form.category_id || null,
            original_price: form.original_price ? parseFloat(form.original_price) : null,
            featured: form.featured,
          },
        });
        toast.success("Produto atualizado!", { id: toastId });
      } else {
        await createProduct.mutateAsync({
          name: form.name,
          price: parseFloat(form.price),
          store_id: store.id,
          description: form.description,
          unit: form.unit,
          image_url: form.image_url || undefined,
          category_id: form.category_id || undefined,
        });
        toast.success("Produto criado!", { id: toastId });
      }
      resetForm();
    } catch {
      toast.error("Erro ao salvar produto", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const toastId = toast.loading("Removendo produto...");
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Produto removido!", { id: toastId });
    } catch {
      toast.error("Erro ao remover produto", { id: toastId });
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description || "",
      unit: p.unit || "un",
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      original_price: p.original_price ? String(p.original_price) : "",
      featured: p.featured || false,
    });
    setEditingId(p.id);
    setShowAdd(true);
  };

  const handleTogglePromo = async (p: any) => {
    const toastId = toast.loading(p.featured ? "Removendo destaque..." : "Adicionando destaque...");
    try {
      await updateProduct.mutateAsync({
        id: p.id,
        updates: { featured: !p.featured },
      });
      toast.success(p.featured ? "Produto removido dos destaques" : "Produto em destaque! ⭐", { id: toastId });
    } catch {
      toast.error("Erro ao alterar destaque", { id: toastId });
    }
  };

  const handleToggleStatus = async () => {
    if (!store) return;
    const newStatus = store.status === "open" ? "closed" : "open";
    const toastId = toast.loading(newStatus === "open" ? "Abrindo loja..." : "Fechando loja...");
    try {
      await storesService.update(store.id, { status: newStatus });
      toast.success(newStatus === "open" ? "Loja aberta!" : "Loja fechada!", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["my-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    } catch {
      toast.error("Erro ao alterar status", { id: toastId });
    }
  };

  const handleOrderStatus = async (orderId: string, status: string) => {
    const labels: Record<string, string> = {
      confirmed: "Confirmando pedido...",
      delivered: "Marcando como entregue...",
      cancelled: "Cancelando pedido...",
    };
    const toastId = toast.loading(labels[status] || "Atualizando...");
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success("Status atualizado!", { id: toastId });
    } catch {
      toast.error("Erro ao atualizar pedido", { id: toastId });
    }
  };

  const openSettings = () => {
    if (!store) return;
    setStoreForm({
      name: store.name, description: store.description || "", address: store.address || "",
      phone: store.phone || "", whatsapp: store.whatsapp, opens_at: store.opens_at || "",
      closes_at: store.closes_at || "", delivery_fee: String(store.delivery_fee ?? 0),
      min_order: String(store.min_order ?? 0), delivery_time_min: String(store.delivery_time_min ?? 30),
      delivery_time_max: String(store.delivery_time_max ?? 60),
    });
    setCoverPreview(store.cover_image || null);
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    if (!store) return;
    const toastId = toast.loading("Salvando configurações...");
    try {
      await storesService.update(store.id, {
        name: storeForm.name, description: storeForm.description, address: storeForm.address,
        phone: storeForm.phone, whatsapp: storeForm.whatsapp, opens_at: storeForm.opens_at || null,
        closes_at: storeForm.closes_at || null, delivery_fee: parseFloat(storeForm.delivery_fee) || 0,
        min_order: parseFloat(storeForm.min_order) || 0, delivery_time_min: parseInt(storeForm.delivery_time_min) || 30,
        delivery_time_max: parseInt(storeForm.delivery_time_max) || 60,
      });
      toast.success("Configurações salvas!", { id: toastId });
      setShowSettings(false);
      queryClient.invalidateQueries({ queryKey: ["my-stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    } catch {
      toast.error("Erro ao salvar configurações", { id: toastId });
    }
  };

  if (storesLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <DashboardSkeleton />
      </main>
    );
  }

  if (!store) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="py-20 text-center text-muted-foreground">
          <Store className="mx-auto h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">Nenhuma loja vinculada</p>
          <p className="text-sm mt-1">Entre em contato com o administrador para vincular sua loja</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">Voltar ao início</Link>
        </div>
      </main>
    );
  }

  // Use isStoreOpen to reflect the real status based on hours
  const reallyOpen = isStoreOpen(store);
  const { label: statusLabel } = getStoreStatusLabel(store);

  const filteredProducts = (products || []).filter(
    (p) => !busca || p.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao marketplace
      </Link>

      {/* Cover image section */}
      <div className="relative mb-6 h-40 sm:h-52 rounded-2xl overflow-hidden border">
        {(coverPreview || store.cover_image) ? (
          <img src={coverPreview || store.cover_image!} alt="Capa" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-secondary flex items-center justify-center">
            <span className="text-4xl">🏪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <label className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-card/90 backdrop-blur-sm px-3 py-2 text-xs font-medium text-card-foreground cursor-pointer hover:bg-card transition-colors shadow-md">
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Enviando..." : "Alterar capa"}
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
        </label>
        <div className="absolute bottom-3 left-3">
          <h2 className="text-lg font-bold text-primary-foreground drop-shadow-md">{store.name}</h2>
        </div>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel do Lojista</h1>
          <p className="text-muted-foreground">{store.name}</p>
        </div>
        <button onClick={openSettings} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Settings className="h-4 w-4" />
          Configurações
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{products?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Produtos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <ShoppingBag className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{orders?.length ?? 0}</p>
              <p className="text-sm text-muted-foreground">Pedidos</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleStatus}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    store.status === "open" ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {store.status === "open" ? "Aberto" : "Fechado"}
                </button>
                {/* Show real-time status hint if has hours */}
                {store.opens_at && store.closes_at && (
                  <span className={`text-[10px] ${reallyOpen ? "text-[hsl(var(--success))]" : "text-muted-foreground"}`}>
                    {reallyOpen ? "Dentro do horário" : "Fora do horário"}
                  </span>
                )}
              </div>
              {store.opens_at && store.closes_at && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Horário: {store.opens_at} - {store.closes_at}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Resumo
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => { resetForm(); setShowAdd(true); }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          {showAdd && (
            <div className="mb-4 rounded-xl border bg-card p-4 animate-scale-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-card-foreground">{editingId ? "Editar Produto" : "Novo Produto"}</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="text" placeholder="Nome do produto *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="number" step="0.01" placeholder="Preço (R$) *" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="text" placeholder="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input type="text" placeholder="Unidade (ex: kg, un, 500ml)" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                {/* Category selector */}
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Sem categoria</option>
                  {(categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                {/* Original price for promo */}
                <input type="number" step="0.01" placeholder="Preço original (promoção)" value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))}
                  className="rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-secondary transition-colors">
                  <ImageIcon className="h-4 w-4" />
                  {uploading ? "Enviando..." : form.image_url ? "Alterar imagem" : "Adicionar imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {form.image_url && <img src={form.image_url} alt="Preview" className="h-10 w-10 rounded-lg object-cover" />}
                {/* Featured toggle */}
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="rounded border-border"
                  />
                  <Star className="h-3.5 w-3.5 text-accent" />
                  <span className="text-muted-foreground">Destaque</span>
                </label>
              </div>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price || createProduct.isPending || updateProduct.isPending}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editingId ? "Atualizar" : "Salvar"}
              </button>
            </div>
          )}

          {productsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">{busca ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}</p>
              {!busca && (
                <button onClick={() => { resetForm(); setShowAdd(true); }} className="mt-3 text-sm text-primary hover:underline">
                  Adicionar primeiro produto
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((p) => {
                const hasDiscount = p.original_price && Number(p.original_price) > Number(p.price);
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {p.image_url && <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground">{p.name}</p>
                          {p.featured && <Star className="h-3 w-3 fill-accent text-accent" />}
                          {hasDiscount && <Badge className="bg-destructive text-destructive-foreground border-0 text-[9px] px-1.5">PROMO</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-bold text-primary">R$ {Number(p.price).toFixed(2).replace(".", ",")}</span>
                          {hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through">R$ {Number(p.original_price).toFixed(2).replace(".", ",")}</span>
                          )}
                          {p.unit && <span className="text-xs text-muted-foreground">{p.unit}</span>}
                          {(p as any).categories?.name && (
                            <Badge variant="outline" className="text-[9px] px-1.5 gap-0.5">
                              <Tag className="h-2.5 w-2.5" />
                              {(p as any).categories.name}
                            </Badge>
                          )}
                          {!p.in_stock && <Badge variant="secondary" className="text-[10px]">Sem estoque</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePromo(p)}
                        title={p.featured ? "Remover destaque" : "Destacar"}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                      >
                        {p.featured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto "{p.name}" será removido permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">Nenhum pedido ainda</p>
              <p className="text-sm mt-1">Os pedidos dos clientes aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                return (
                  <div key={order.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{items.length} itens</p>
                        {order.notes && <p className="text-xs text-muted-foreground mt-1">📝 {order.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">R$ {Number(order.total).toFixed(2).replace(".", ",")}</p>
                        <Badge className={`mt-1 ${order.status === "pending" ? "bg-accent text-accent-foreground" : order.status === "confirmed" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} border-0`}>
                          {order.status === "pending" ? "Pendente" : order.status === "confirmed" ? "Confirmado" : order.status === "delivered" ? "Entregue" : order.status === "cancelled" ? "Cancelado" : order.status}
                        </Badge>
                      </div>
                    </div>
                    {order.status === "pending" && (
                      <div className="flex gap-2 mt-3 border-t pt-3">
                        <button onClick={() => handleOrderStatus(order.id, "confirmed")} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                          Confirmar
                        </button>
                        <button onClick={() => handleOrderStatus(order.id, "cancelled")} className="rounded-lg border px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                          Cancelar
                        </button>
                      </div>
                    )}
                    {order.status === "confirmed" && (
                      <div className="mt-3 border-t pt-3">
                        <button onClick={() => handleOrderStatus(order.id, "delivered")} className="w-full rounded-lg bg-[hsl(var(--success))] py-2 text-sm font-medium text-[hsl(var(--success-foreground))] hover:opacity-90 transition-opacity">
                          Marcar como Entregue
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab - Simplified */}
        <TabsContent value="analytics">
          <AnalyticsDashboard storeId={store.id} storeName={store.name} />
        </TabsContent>
      </Tabs>

      {/* Store Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Configurações da Loja</h2>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            {/* Status explanation */}
            <div className="mb-4 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-foreground mb-1">Como funciona o status:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• <strong>Status "Aberto"</strong> + horário configurado = aberto somente no horário</li>
                <li>• <strong>Status "Aberto"</strong> sem horário = sempre aberto</li>
                <li>• <strong>Status "Fechado"</strong> = sempre fechado independente do horário</li>
              </ul>
            </div>

            {/* Cover image in settings */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground">Foto de capa</label>
              <div className="relative mt-1 h-32 rounded-xl overflow-hidden border">
                {coverPreview ? (
                  <img src={coverPreview} alt="Capa" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-secondary flex items-center justify-center">
                    <span className="text-3xl">🏪</span>
                  </div>
                )}
                <label className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-card/90 backdrop-blur-sm px-2.5 py-1.5 text-xs font-medium text-card-foreground cursor-pointer hover:bg-card transition-colors">
                  <Upload className="h-3 w-3" />
                  {uploading ? "Enviando..." : "Alterar"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome</label>
                <input type="text" value={storeForm.name} onChange={(e) => setStoreForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Descrição</label>
                <textarea value={storeForm.description} onChange={(e) => setStoreForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" rows={2} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Endereço</label>
                <input type="text" value={storeForm.address} onChange={(e) => setStoreForm((f) => ({ ...f, address: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Telefone</label>
                  <input type="text" value={storeForm.phone} onChange={(e) => setStoreForm((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">WhatsApp</label>
                  <input type="text" value={storeForm.whatsapp} onChange={(e) => setStoreForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Abre às</label>
                  <input type="time" value={storeForm.opens_at} onChange={(e) => setStoreForm((f) => ({ ...f, opens_at: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Fecha às</label>
                  <input type="time" value={storeForm.closes_at} onChange={(e) => setStoreForm((f) => ({ ...f, closes_at: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Taxa de entrega (R$)</label>
                  <input type="number" step="0.5" value={storeForm.delivery_fee} onChange={(e) => setStoreForm((f) => ({ ...f, delivery_fee: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Pedido mínimo (R$)</label>
                  <input type="number" step="0.5" value={storeForm.min_order} onChange={(e) => setStoreForm((f) => ({ ...f, min_order: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tempo mín. (min)</label>
                  <input type="number" value={storeForm.delivery_time_min} onChange={(e) => setStoreForm((f) => ({ ...f, delivery_time_min: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tempo máx. (min)</label>
                  <input type="number" value={storeForm.delivery_time_max} onChange={(e) => setStoreForm((f) => ({ ...f, delivery_time_max: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>
            <button onClick={handleSaveSettings} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Salvar Configurações
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
