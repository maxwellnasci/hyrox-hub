import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Check, Clock, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { startOfWeek, addDays, toISODate, DAYS, formatWeekRange } from "@/lib/week";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Hyrox Training" }] }),
  component: Dashboard,
});

type Workout = {
  id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  duration_min: number | null;
};

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const weekIso = toISODate(weekStart);

  const workoutsQ = useQuery({
    queryKey: ["workouts", weekIso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("id,title,description,day_of_week,duration_min")
        .eq("week_start", weekIso)
        .order("day_of_week");
      if (error) throw error;
      return (data ?? []) as Workout[];
    },
  });

  const completionsQ = useQuery({
    queryKey: ["completions", weekIso, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const ids = (workoutsQ.data ?? []).map((w) => w.id);
      if (ids.length === 0) return new Set<string>();
      const { data, error } = await supabase
        .from("workout_completions")
        .select("workout_id")
        .in("workout_id", ids);
      if (error) throw error;
      return new Set((data ?? []).map((c) => c.workout_id));
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ workoutId, done }: { workoutId: string; done: boolean }) => {
      if (done) {
        const { error } = await supabase
          .from("workout_completions")
          .delete()
          .eq("workout_id", workoutId)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workout_completions")
          .insert({ workout_id: workoutId, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["completions", weekIso, user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const by: Record<number, Workout[]> = {};
    for (const w of workoutsQ.data ?? []) {
      (by[w.day_of_week] ??= []).push(w);
    }
    return by;
  }, [workoutsQ.data]);

  const completed = completionsQ.data ?? new Set<string>();
  const totalWorkouts = workoutsQ.data?.length ?? 0;
  const doneCount = (workoutsQ.data ?? []).filter((w) => completed.has(w.id)).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Esta semana</h1>
          <p className="text-sm text-muted-foreground mt-1">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {totalWorkouts > 0 && (
        <Card className="p-4 mb-6 bg-card/60 border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Progresso da semana</div>
                <div className="text-xs text-muted-foreground">
                  {doneCount} de {totalWorkouts} treinos concluídos
                </div>
              </div>
            </div>
            <div className="text-2xl font-display font-bold">
              {Math.round((doneCount / totalWorkouts) * 100)}%
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(doneCount / totalWorkouts) * 100}%` }}
            />
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {DAYS.map((dayName, idx) => {
          const today =
            toISODate(addDays(weekStart, idx)) === toISODate(new Date());
          const items = grouped[idx] ?? [];
          return (
            <div key={idx}>
              <div className="flex items-center gap-2 px-1 mb-2">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    today ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {dayName}
                </span>
                {today && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold uppercase">
                    Hoje
                  </span>
                )}
              </div>
              {items.length === 0 ? (
                <Card className="p-4 bg-card/40 border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground">Dia de descanso</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {items.map((w) => {
                    const done = completed.has(w.id);
                    return (
                      <Card
                        key={w.id}
                        className={cn(
                          "p-4 transition-all",
                          done && "bg-card/60 opacity-70",
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              toggle.mutate({ workoutId: w.id, done })
                            }
                            disabled={toggle.isPending}
                            aria-label={done ? "Marcar como não feito" : "Marcar como feito"}
                            className={cn(
                              "mt-0.5 h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
                              done
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border hover:border-primary",
                            )}
                          >
                            {done && <Check className="h-5 w-5" strokeWidth={3} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className={cn(
                                  "font-semibold",
                                  done && "line-through",
                                )}
                              >
                                {w.title}
                              </h3>
                              {w.duration_min != null && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {w.duration_min} min
                                </span>
                              )}
                            </div>
                            {w.description && (
                              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                                {w.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {workoutsQ.isLoading && (
        <p className="text-sm text-muted-foreground text-center mt-8">Carregando treinos…</p>
      )}
      {!workoutsQ.isLoading && totalWorkouts === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-8">
          Nenhum treino programado para esta semana.
        </p>
      )}
    </div>
  );
}
