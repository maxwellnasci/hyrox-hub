import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listStudents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Verify caller is admin
    const { data: roles, error: rolesErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (rolesErr) throw new Error(rolesErr.message);
    if (!(roles ?? []).some((r) => r.role === "admin")) {
      throw new Error("Acesso negado");
    }

    // Load all roles to classify users
    const { data: allRoles, error: allRolesErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role");
    if (allRolesErr) throw new Error(allRolesErr.message);

    const adminIds = new Set(
      (allRoles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id),
    );

    // List all users from auth
    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersErr) throw new Error(usersErr.message);

    // Completion counts
    const { data: completions } = await supabaseAdmin
      .from("workout_completions")
      .select("user_id");
    const countByUser = new Map<string, number>();
    for (const c of completions ?? []) {
      countByUser.set(c.user_id, (countByUser.get(c.user_id) ?? 0) + 1);
    }

    const students = usersData.users
      .filter((u) => !adminIds.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        completions: countByUser.get(u.id) ?? 0,
      }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

    return { students };
  });
