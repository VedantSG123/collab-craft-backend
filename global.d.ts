export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string
      SUPABASE_ANON_KEY: string
      DATABASE_UR: string
      SUPABASE_URL: string
    }
  }
}
