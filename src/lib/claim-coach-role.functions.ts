import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const claimCoachRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const expected = process.env.COACH_INVITE_CODE;
    if (!expected) {
      throw new Error("Coach invite code not configured");
    }
    if (data.code !== expected) {
      return { ok: false as const, error: "Invalid invite code" };
    }
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    // ignore unique-violation
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      return { ok: false as const, error: error.message };
    }
    return { ok: true as const };
  });
