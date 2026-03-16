import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Store, Users, ShoppingBag, Plus, X, Search,
  Shield, ShieldCheck, User as UserIcon, Eye, EyeOff, UserCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";

const createStoreSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(6, "Senha mínima: 6 caracteres"),
  storeName: z.string().trim().min(2, "Nome do mercado obrigatório"),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").regex(/^[\d+\s()-]+$/, "WhatsApp: apenas números"),
});

const Admin = () => {
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchStores, setSearchStores] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed" | "maintenance">("all");
  const [searchUsers, setSearchUsers] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: "", password: "", displayName: "", storeName: "", whatsapp: "", address: "", neighborhood: "Lagoa Azul",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesResult, usersResult, ordersResult] = await Promise.allSettled([
        adminService.getAllStores(),
        adminService.getAllProfiles(),
        adminService.getAllOrders(),
      ]);

      if (storesResult.status === "fulfilled") {
        setStores(storesResult.value || []);
      } else {
        setStores([]);
        console.error("Erro ao carregar mercados:", storesResult.reason);
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value || []);
      } else {
        setUsers([]);
        console.error("Erro ao carregar usuários:", usersResult.reason);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value || []);
      } else {
        setOrders([]);
        console.error("Erro ao carregar pedidos:", ordersResult.reason);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    setFormErrors({});
    const result = createStoreSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        if (e.path[0]) errs[e.path[0] as string] = e.message;
      });
      setFormErrors(errs);
      return;
    }
    setCreating(true);
    const toastId = toast.loading("Criando mercado e lojista...");
    try {
      await adminService.createStoreOwner(form);
      toast.success("Mercado criado com sucesso! O lojista já pode acessar o painel.", { id: toastId, duration: 5000 });
      setShowCreate(false);
      setForm({ email: "", password: "", displayName: "", storeName: "", whatsapp: "", address: "", neighborhood: "Lagoa Azul" });
      loadData();
    } catch (err: any) {
      const msg = err?.message || "Erro ao criar mercado";
      if (msg.includes("already been registered") || msg.includes("already registered")) {
        toast.error("Este e-mail já está cadastrado. Use outro e-mail.", { id: toastId });
      } else {
        toast.error(msg, { id: toastId });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStore = async (storeId: string, currentStatus: string) => {
    // Não permite abrir/fechar quando está desativado (maintenance)
    if (currentStatus === "maintenance") return;

    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await adminService.updateStoreStatus(storeId, newStatus as any);
      toast.success(newStatus === "open" ? "Mercado aberto!" : "Mercado fechado!");
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, status: newStatus } : s)));
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const handleDeactivateStore = async (storeId: string, currentStatus: string) => {
    const newStatus = currentStatus === "maintenance" ? "closed" : "maintenance";
    try {
      await adminService.updateStoreStatus(storeId, newStatus as any);
      toast.success(newStatus === "maintenance" ? "Mercado desativado!" : "Mercado reativado!");
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, status: newStatus } : s)));
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success("Permissão atualizada!");
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, user_roles: [{ role: newRole }] } : u
        )
      );
    } catch {
      toast.error("Erro ao alterar permissão");
    }
  };

  const filteredStores = stores.filter((s) => {
    const matchesSearch = !searchStores || s.name.toLowerCase().includes(searchStores.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(
    (u) => !searchUsers || (u.display_name || "").toLowerCase().includes(searchUsers.toLowerCase())
  );

  const roleIcon = (role: string) => {
    if (role === "admin") return <ShieldCheck className="h-3.5 w-3.5" />;
    if (role === "moderator") return <Shield className="h-3.5 w-3.5" />;
    return <UserIcon className="h-3.5 w-3.5" />;
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      admin: "bg-destructive text-destructive-foreground",
      moderator: "bg-primary text-primary-foreground",
      user: "bg-muted text-muted-foreground",
    };
    const labels: Record<string, string> = { admin: "Admin", moderator: "Lojista", user: "Cliente" };
    return (
      <Badge className={`${map[role] || map.user} border-0 gap-1 text-[10px]`}>
        {roleIcon(role)}
        {labels[role] || role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao marketplace
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie mercados, usuários e pedidos</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" />
          Novo Mercado
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stores.length}</p>
              <p className="text-sm text-muted-foreground">Mercados</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">
                Usuários{" "}
                <span className="text-xs text-muted-foreground/80 block">
                  {users.filter((u) => u.user_roles?.[0]?.role === "user").length} clientes •{" "}
                  {users.filter((u) => u.user_roles?.[0]?.role === "moderator").length} lojistas
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {users.filter((u) => {
                  const role = u.user_roles?.[0]?.role;
                  // Considera como cliente quem não é admin/moderator
                  return !role || role === "user";
                }).length}
              </p>
              <p className="text-sm text-muted-foreground">Clientes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--success))]/10">
              <ShoppingBag className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="stores">
        <TabsList className="mb-6">
          <TabsTrigger value="stores">Mercados</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
        </TabsList>

        {/* Stores Tab */}
        <TabsContent value="stores">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar mercados..."
                value={searchStores}
                onChange={(e) => setSearchStores(e.target.value)}
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "open", label: "Abertos" },
                { value: "closed", label: "Fechados" },
                { value: "maintenance", label: "Desativados" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value as any)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {filteredStores.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Store className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">Nenhum mercado encontrado</p>
              <p className="text-sm mt-1">Clique em "Novo Mercado" para cadastrar o primeiro</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStores.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/50">
                  <div className="flex items-center gap-3">
                    {s.logo_url && <img src={s.logo_url} alt={s.name} className="h-10 w-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium text-card-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.neighborhood || "Sem bairro"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        WhatsApp: <span className="font-medium">{s.whatsapp}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`border-0 text-[10px] ${
                        s.status === "open"
                          ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.status === "open" ? "Aberto" : s.status === "maintenance" ? "Desativado" : "Fechado"}
                    </Badge>
                    {s.status !== "maintenance" && (
                      <button
                        onClick={() => handleToggleStore(s.id, s.status)}
                        className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {s.status === "open" ? "Fechar" : "Abrir"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeactivateStore(s.id, s.status)}
                      className="rounded-lg border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {s.status === "maintenance" ? "Reativar" : "Desativar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar usuários..." value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)}
              className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => {
                const userRole = u.user_roles?.[0]?.role || "user";
                return (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-card-foreground">{u.display_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{u.phone || "Sem telefone"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {roleBadge(userRole)}
                      {userRole !== "admin" && (
                        <select
                          value={userRole}
                          onChange={(e) => handleRoleChange(u.user_id, e.target.value as any)}
                          className="rounded-lg border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="user">Cliente</option>
                          <option value="moderator">Lojista</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingBag className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium">Nenhum pedido registrado</p>
              <p className="text-sm mt-1">Os pedidos dos clientes aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => {
                const orderItems = Array.isArray(o.items) ? o.items : [];
                return (
                  <div key={o.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="font-medium text-card-foreground mt-1">{(o as any).stores?.name || "Loja"}</p>
                        <p className="text-sm text-muted-foreground">{orderItems.length} {orderItems.length === 1 ? "item" : "itens"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">R$ {Number(o.total).toFixed(2).replace(".", ",")}</p>
                        <Badge className={`mt-1 border-0 text-[10px] ${
                          o.status === "pending" ? "bg-accent text-accent-foreground"
                          : o.status === "confirmed" ? "bg-primary text-primary-foreground"
                          : o.status === "delivered" ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                          : "bg-destructive text-destructive-foreground"
                        }`}>
                          {o.status === "pending" ? "Pendente" : o.status === "confirmed" ? "Confirmado" : o.status === "delivered" ? "Entregue" : "Cancelado"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Store Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Cadastrar Novo Mercado</h2>
              <button onClick={() => { setShowCreate(false); setFormErrors({}); }} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">Isso criará um novo usuário lojista e vinculará o mercado automaticamente.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome do Mercado *</label>
                <input type="text" value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Ex: Mercadinho do João" />
                {formErrors.storeName && <p className="mt-1 text-xs text-destructive">{formErrors.storeName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">E-mail do lojista *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="lojista@email.com" />
                  {formErrors.email && <p className="mt-1 text-xs text-destructive">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Senha *</label>
                  <div className="relative mt-1">
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      className="w-full rounded-lg border bg-background px-3 py-2 pr-9 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Mínimo 6 caracteres" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="mt-1 text-xs text-destructive">{formErrors.password}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nome do lojista</label>
                <input type="text" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Nome completo" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">WhatsApp *</label>
                  <input type="text" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="5584999999999" />
                  {formErrors.whatsapp && <p className="mt-1 text-xs text-destructive">{formErrors.whatsapp}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Bairro</label>
                  <input type="text" value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Endereço</label>
                <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Rua, número" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreate(false); setFormErrors({}); }} className="flex-1 rounded-lg border py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                {creating ? "Criando..." : "Criar Mercado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Admin;
