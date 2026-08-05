import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client — used by AuthContext for real
// sign-up/login/logout. Session is persisted automatically (Supabase
// stores it in localStorage under the hood), so refreshing the page
// keeps you logged in.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
