import { getSupabaseClient } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Link from "next/link";

export default async function DiningPlacePage({ params }) {
  const supabase = getSupabaseClient();
  let restaurant = null;
  let error = null;

  if (supabase) {
    const { data, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', params.slug)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        notFound();
      }
      error = fetchError.message;
    } else {
      restaurant = data;
    }
  } else {
    error = "Supabase client not configured";
  }

  if (error) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error loading dining place:</strong> {error}
        </div>
      </main>
    );
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dining" 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Dining Places
        </Link>
      </div>

      <Card>
        <div className="relative h-48 w-full bg-gray-50 dark:bg-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">🍽️</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-800 mb-3">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="blue">
                  {restaurant.type}
                </Badge>
                <Badge variant="outline">
                  Gluten-Free
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                About This {restaurant.type}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This {restaurant.type} offers gluten-free options for diners with celiac disease or gluten sensitivity. 
                Enjoy delicious food without worrying about cross-contamination. Our team has verified that this establishment 
                follows proper gluten-free protocols to ensure your safety.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ✓ Gluten-Free Certified
              </h3>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                This establishment has been verified to offer safe gluten-free dining options with proper cross-contamination protocols.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                🍽️ Dining Experience
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Enjoy a worry-free dining experience with dedicated gluten-free menu options and knowledgeable staff.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Location & Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Establishment Type</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{restaurant.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-medium text-gray-900 dark:text-white">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
