import { getSupabaseClient } from "./supabaseClient";
import restaurantsJson from "@/data/restaurants.json";
import ingredientsJson from "@/data/ingredients.json";
import productsJson from "@/data/products.json";

export async function fetchRestaurants() {
  const supabase = getSupabaseClient();
  if (!supabase) return restaurantsJson;
  const { data, error } = await supabase
    .from("restaurants")
    .select("slug,name,type,location,note,tags,rating,image")
    .order("updated_at", { ascending: false });
  if (error || !data) return restaurantsJson;
  return data;
}

export async function fetchIngredients() {
  const supabase = getSupabaseClient();
  if (!supabase) return ingredientsJson;
  const { data, error } = await supabase
    .from("ingredients")
    .select("name,status,note")
    .order("updated_at", { ascending: false });
  if (error || !data) return ingredientsJson;
  return data;
}

export async function fetchProducts() {
  const supabase = getSupabaseClient();
  if (!supabase) return productsJson;
  const { data, error } = await supabase
    .from("products")
    .select("slug,name,vendor,price,note,url,image,tags")
    .order("updated_at", { ascending: false });
  if (error || !data) return productsJson;
  return data;
}

export async function fetchPageBySlug(slug) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("pages")
    .select("title,description,content_md")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}
