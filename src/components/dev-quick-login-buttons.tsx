import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEV_TEST_ACCOUNTS, type DevTestRole } from "@/lib/dev-test-accounts";
import { ensureDevTestUser } from "@/lib/ensure-dev-test-users.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

async function signInOrSignUp(email: string, password: string) {
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error) return signIn;

  if (!/invalid|credentials|not found/i.test(signIn.error.message)) {
    throw signIn.error;
  }

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error) throw signUp.error;

  if (signUp.data.session) return signUp;

  const retry = await supabase.auth.signInWithPassword({ email, password });
  if (retry.error) {
    throw new Error(
      "Conta demo criada, mas o login falhou. Desative confirmação de email no Supabase (Auth → Providers → Email).",
    );
  }
  return retry;
}

export function DevQuickLoginButtons() {
  const navigate = useNavigate();
  const { refreshRole } = useAuth();
  const ensureUser = useServerFn(ensureDevTestUser);
  const [loadingRole, setLoadingRole] = useState<DevTestRole | null>(null);

  if (!import.meta.env.DEV) return null;

  const quickLogin = async (role: DevTestRole) => {
    setLoadingRole(role);
    try {
      const account = DEV_TEST_ACCOUNTS[role];

      if (role === "admin") {
        try {
          await ensureUser({ data: { role: "admin" } });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (/service.role|SUPABASE_SERVICE_ROLE_KEY/i.test(msg)) {
            toast.error("Adicione SUPABASE_SERVICE_ROLE_KEY no .env para login admin demo.");
            return;
          }
          throw err;
        }
      } else {
        try {
          await ensureUser({ data: { role: "student" } });
        } catch {
          await signInOrSignUp(account.email, account.password);
        }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await refreshRole();
      toast.success(role === "admin" ? "Entrou como coach (demo)" : "Entrou como aluno (demo)");
      navigate({ to: role === "admin" ? "/admin" : "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no login demo");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-primary">
        Dev — validação rápida
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/40"
          disabled={loadingRole !== null}
          onClick={() => quickLogin("student")}
        >
          <GraduationCap className="mr-2 h-4 w-4" />
          {loadingRole === "student" ? "Entrando…" : DEV_TEST_ACCOUNTS.student.label}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/40"
          disabled={loadingRole !== null}
          onClick={() => quickLogin("admin")}
        >
          <Shield className="mr-2 h-4 w-4" />
          {loadingRole === "admin" ? "Entrando…" : DEV_TEST_ACCOUNTS.admin.label}
        </Button>
      </div>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        Aluno: cria conta automaticamente. Admin: precisa de{" "}
        <code className="text-primary">SUPABASE_SERVICE_ROLE_KEY</code> no <code>.env</code>.
      </p>
    </div>
  );
}
