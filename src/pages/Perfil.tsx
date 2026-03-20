import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, User, MapPin } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  display_name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const Perfil = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile(user.id);
        if (profile) {
          setForm({
            display_name: profile.display_name || "",
            phone: profile.phone || "",
            address: (profile as any).address || "",
          });
        }
      } catch {
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setErrors({});
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!user) return;
    setSaving(true);
    const toastId = toast.loading("Salvando perfil...");
    try {
      await authService.updateProfile(user.id, {
        display_name: form.display_name,
        phone: form.phone || undefined,
        address: form.address || undefined,
      } as any);
      toast.success("Perfil atualizado com sucesso!", { id: toastId });
    } catch {
      toast.error("Erro ao salvar perfil", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <Label htmlFor="display_name">Nome completo</Label>
          <Input
            id="display_name"
            placeholder="Seu nome"
            value={form.display_name}
            onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          />
          {errors.display_name && <p className="mt-1 text-xs text-destructive">{errors.display_name}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(84) 99999-9999"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="address" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Endereço de entrega
          </Label>
          <Input
            id="address"
            placeholder="Rua, número, bairro"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Necessário para finalizar pedidos via WhatsApp
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Salvando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Perfil
            </span>
          )}
        </Button>
      </div>
    </main>
  );
};

export default Perfil;
