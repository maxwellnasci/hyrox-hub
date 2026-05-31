import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, CheckCircle2, Flame, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hyrox Hub — Treinos semanais para coaches e atletas" },
      {
        name: "description",
        content:
          "Planeje a semana Hyrox, acompanhe check-ins dos alunos e mantenha o time no ritmo.",
      },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: LayoutDashboard,
    title: "Painel semanal",
    description: "Treinos organizados de segunda a domingo, com progresso visual da semana.",
  },
  {
    icon: CheckCircle2,
    title: "Check-ins rápidos",
    description: "Alunos marcam treinos concluídos em um toque — simples como Strava.",
  },
  {
    icon: Flame,
    title: "Modo treinador",
    description: "Coach monta o plano, edita treinos e acompanha quem está treinando.",
  },
];

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-primary/40" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-6">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">
              Começar
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-12 md:pt-20">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Hyrox training hub
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Seu time Hyrox,{" "}
            <span className="text-primary">semana a semana</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            Coaches publicam o plano. Atletas executam e marcam conclusão. Tudo em um painel
            escuro, rápido e focado no que importa.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="min-w-[180px]">
                Criar conta grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3 md:mt-20">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-border/60 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </Card>
          ))}
        </section>

        <section className="mt-16 rounded-2xl border border-border/60 bg-card/40 p-8 text-center md:mt-20">
          <h2 className="font-display text-2xl font-bold">Pronto para validar com seu time?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            MVP focado em coach + aluno. Cadastre-se, peça o código de treinador e monte a
            primeira semana em minutos.
          </p>
          <Link to="/signup" className="mt-6 inline-block">
            <Button>
              Começar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Hyrox Hub — demo MVP
      </footer>
    </div>
  );
}
