import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const claimCoachRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        code: z.string().min(1).max(200),
        accessToken: z.string().min(10).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const expected = process.env.COACH_INVITE_CODE;
    if (!expected) {
      return { ok: false as const, error: "Coach invite code not configured" };
    }
    if (data.code !== expected) {
      return { ok: false as const, error: "Invalid invite code" };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(
      data.accessToken,
    );
    if (userErr || !userData.user) {
      return { ok: false as const, error: "Not authenticated" };
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userData.user.id, role: "admin" });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });
