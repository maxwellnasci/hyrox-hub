import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DEV_TEST_ACCOUNTS, type DevTestRole } from "@/lib/dev-test-accounts";

function assertDevEnvironment() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev test login is disabled in production");
  }
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function ensureUser(role: DevTestRole): Promise<string> {
  const { email, password } = DEV_TEST_ACCOUNTS[role];

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (data.user) return data.user.id;

  if (error && /already|registered|exists/i.test(error.message)) {
    const existingId = await findUserIdByEmail(email);
    if (existingId) return existingId;
  }

  if (error) throw error;
  throw new Error("Could not create or find demo user");
}

export const ensureDevTestUser = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ role: z.enum(["student", "admin"]) }).parse(input))
  .handler(async ({ data }) => {
    assertDevEnvironment();

    const userId = await ensureUser(data.role);

    if (data.role === "admin") {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        throw error;
      }
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "student" }, { onConflict: "user_id,role" });
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        throw error;
      }
    }

    return { ok: true as const, role: data.role };
  });
