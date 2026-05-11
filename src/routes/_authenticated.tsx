import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  const onDashboard = location.pathname.startsWith("/dashboard");
  const onAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 sticky top-0 z-30 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary" />
            <span className="font-display text-lg font-bold tracking-tight">HYROX</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link to="/dashboard">
              <Button variant={onDashboard ? "secondary" : "ghost"} size="sm">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Painel</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant={onAdmin ? "secondary" : "ghost"} size="sm">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Treinador</span>
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sair</span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
