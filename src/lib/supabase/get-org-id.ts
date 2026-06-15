import { createClient } from "@/lib/supabase/client";

let cachedOrgId: string | null = null;

export async function getOrgId(): Promise<string> {
  if (cachedOrgId) return cachedOrgId;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  cachedOrgId = (data as { organization_id: string } | null)?.organization_id ?? null;
  if (!cachedOrgId) throw new Error("No organization found for this user");
  return cachedOrgId;
}

export function clearOrgIdCache() {
  cachedOrgId = null;
}
