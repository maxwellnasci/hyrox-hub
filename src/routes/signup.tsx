import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { claimCoachRole } from "@/lib/claim-coach-role.functions";
import { AuthPageShell } from "@/components/auth-page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Criar conta — Hyrox Training" }],
  }),
  component: SignupPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um email válido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(100),
  inviteCode: z.string().trim().max(200).optional(),
});

function SignupPage() {
  const { user, loading, refreshRole } = useAuth();
  const navigate = useNavigate();
  const claim = useServerFn(claimCoachRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, inviteCode: inviteCode || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    if (parsed.data.inviteCode && data.session) {
      const result = await claim({
        data: { code: parsed.data.inviteCode, accessToken: data.session.access_token },
      });
      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Acesso de treinador liberado");
      }
      await refreshRole();
    }

    setSubmitting(false);
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      toast.success("Verifique seu email para confirmar a conta.");
    }
  };

  return (
    <AuthPageShell
      title="Criar conta"
      subtitle="Comece a treinar hoje."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">
              Código de convite do treinador <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Deixe em branco se você for aluno"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>
    </AuthPageShell>
  );
}
