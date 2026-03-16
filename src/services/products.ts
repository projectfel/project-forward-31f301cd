import { supabase } from "@/integrations/supabase/client";

export const productsService = {
  async getByStore(storeId: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, icon)")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from("products")
      .select("*, stores(name)")
      .eq("featured", true)
      .eq("in_stock", true)
      .limit(8);
    if (error) throw error;
    return data;
  },

  async create(product: {
    name: string;
    price: number;
    store_id: string;
    category_id?: string;
    description?: string;
    unit?: string;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
