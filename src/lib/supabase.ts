import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const hostedOriginal = !!configuredUrl && /pkoysigjsorpefekkiqf|bjgfpygzmosxahvcqrwe/.test(configuredUrl)
const supabaseUrl = !configuredUrl || hostedOriginal ? "http://localhost:3000/backend" : configuredUrl
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || "local-public-key"

if (hostedOriginal) {
  console.warn("FC Clubs: o cliente local nao usa o Supabase do site original. As chamadas vao para o backend em localhost:3000.")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
