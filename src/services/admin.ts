import { supabase } from "@/integrations/supabase/client";

export const adminService = {
  async getAllStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, stores(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  },

  async updateStoreStatus(storeId: string, status: "open" | "closed" | "maintenance") {
    const { data, error } = await supabase
      .from("stores")
      .update({ status })
      .eq("id", storeId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteStore(storeId: string) {
    // First delete products
    await supabase.from("products").delete().eq("store_id", storeId);
    // Then delete the store
    const { error } = await supabase.from("stores").delete().eq("id", storeId);
    if (error) throw error;
  },

  async updateUserRole(userId: string, role: "admin" | "moderator" | "user") {
    const { data, error } = await supabase
      .from("user_roles")
      .update({ role })
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createStoreOwner(params: {
    email: string;
    password: string;
    displayName?: string;
    storeName: string;
    whatsapp: string;
    address?: string;
    neighborhood?: string;
  }) {
    const { data, error } = await supabase.functions.invoke("admin-create-store-owner", {
      body: params,
    });
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data: allStores, error: storesErr } = await supabase
      .from("stores")
      .select("id");
    if (storesErr) throw storesErr;

    const { data: allProfiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id");
    if (profilesErr) throw profilesErr;

    const { data: clientRoles, error: clientsErr } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "user");
    if (clientsErr) throw clientsErr;

    const { data: allOrders, error: ordersErr } = await supabase
      .from("orders")
      .select("id");
    if (ordersErr) throw ordersErr;

    return {
      totalStores: allStores?.length ?? 0,
      totalRegisteredUsers: allProfiles?.length ?? 0,
      totalClients: clientRoles?.length ?? 0,
      totalOrders: allOrders?.length ?? 0,
    };
  },
};
