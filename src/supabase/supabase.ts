import { createClient } from "@supabase/supabase-js"

if (!process.env.SUPABASE_URL) {
  console.log("No db url")
}
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string
)

export default supabase
