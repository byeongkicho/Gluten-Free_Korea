// Supabase Configuration
// To connect your app to Supabase, you need to:

// 1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zckxmybvjmkhtdoynsop
// 2. Navigate to Settings > API
// 3. Copy the following values:

export const supabaseConfig = {
  // Your project URL (you can see this in your dashboard)
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zckxmybvjmkhtdoynsop.supabase.co',
  
  // Your anon/public key (found in Settings > API)
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key_here',
  
  // Optional: Service role key for server-side operations
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key_here'
};

// Instructions for setting up environment variables:
// 1. Create a file called .env.local in your project root
// 2. Add the following lines (replace with your actual values):
//    NEXT_PUBLIC_SUPABASE_URL=https://zckxmybvjmkhtdoynsop.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
//    SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
// 3. Restart your development server
