import { SupabaseStorageProvider } from "./providers/supabase";

/**
 * Returns the active storage provider.
 * Later this can be switched to AWS, Azure, or Google Cloud
 * without changing the rest of the application.
 */
export function getStorageProvider() {
  return new SupabaseStorageProvider();
}