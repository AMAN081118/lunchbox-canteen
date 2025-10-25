export const bucketName = "menu-dishes";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Usually set in your .env.local
export const fullUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
