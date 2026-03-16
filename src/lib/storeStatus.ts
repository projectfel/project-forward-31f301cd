/**
 * Determina se um mercado está aberto.
 *
 * Regras:
 * - status "maintenance" → sempre fechado (desativado)
 * - se há horário configurado (opens_at/closes_at):
 *    - status "closed"  → sempre fechado
 *    - status "open"    → aberto somente dentro do horário configurado
 * - se não há horário configurado:
 *    - status "open"    → aberto
 *    - status "closed"  → fechado
 */
export function isStoreOpen(store: {
  status: string;
  opens_at?: string | null;
  closes_at?: string | null;
}): boolean {
  if (store.status === "maintenance") return false;

  const hasHours = !!store.opens_at && !!store.closes_at;

  if (hasHours) {
    if (store.status === "closed") return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = store.opens_at!.split(":").map(Number);
    const [closeH, closeM] = store.closes_at!.split(":").map(Number);
    const opensMinutes = openH * 60 + openM;
    const closesMinutes = closeH * 60 + closeM;

    // Horário que atravessa a meia-noite (ex: 22:00 - 06:00)
    if (closesMinutes <= opensMinutes) {
      return currentMinutes >= opensMinutes || currentMinutes < closesMinutes;
    }
    return currentMinutes >= opensMinutes && currentMinutes < closesMinutes;
  }

  // Sem horário configurado, usa apenas o status manual
  return store.status === "open";
}

export function getStoreStatusLabel(store: {
  status: string;
  opens_at?: string | null;
  closes_at?: string | null;
}): { label: string; isOpen: boolean } {
  if (store.status === "maintenance") {
    return { label: "Desativado", isOpen: false };
  }

  const open = isStoreOpen(store);
  return { label: open ? "Aberto" : "Fechado", isOpen: open };
}
