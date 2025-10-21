import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true, //Saves session to localStoage/cookie
      detectSessionInUrl: true, // For OAuth redirects(if needed)
    },
  },
);
