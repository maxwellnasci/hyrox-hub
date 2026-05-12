import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Plus, Pencil, Trash2, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listStudents } from "@/lib/list-students.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { startOfWeek, addDays, toISODate, DAYS, formatWeekRange } from "@/lib/week";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Treinador — Hyrox Training" }] }),
  component: AdminPage,
});

type Workout = {
  id: string;
  title: string;
  description: string | null;
  day_of_week: number;
  duration_min: number | null;
  week_start: string;
};

const formSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(120),
  description: z.string().trim().max(2000).optional(),
  day_of_week: z.number().int().min(0).max(6),
  duration_min: z.number().int().min(0).max(600).optional(),
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const weekIso = toISODate(weekStart);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [isAdmin, loading, navigate]);

  const workoutsQ = useQuery({
    queryKey: ["admin-workouts", weekIso],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("id,title,description,day_of_week,duration_min,week_start")
        .eq("week_start", weekIso)
        .order("day_of_week");
      if (error) throw error;
      return (data ?? []) as Workout[];
    },
  });

  const grouped = useMemo(() => {
    const by: Record<number, Workout[]> = {};
    for (const w of workoutsQ.data ?? []) (by[w.day_of_week] ??= []).push(w);
    return by;
  }, [workoutsQ.data]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workouts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Treino excluído");
      qc.invalidateQueries({ queryKey: ["admin-workouts", weekIso] });
      qc.invalidateQueries({ queryKey: ["workouts", weekIso] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">Painel do treinador</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monte o programa para seus atletas.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar treino
            </Button>
          </DialogTrigger>
          <WorkoutDialogContent
            weekIso={weekIso}
            editing={editing}
            onClose={() => {
              setDialogOpen(false);
              setEditing(null);
            }}
          />
        </Dialog>
      </div>

      <Card className="p-3 my-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{formatWeekRange(weekStart)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setWeekStart((d) => addDays(d, -7))}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Esta semana
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart((d) => addDays(d, 7))}>
            Próxima
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {DAYS.map((dayName, idx) => {
          const items = grouped[idx] ?? [];
          return (
            <div key={idx}>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                {dayName}
              </div>
              {items.length === 0 ? (
                <Card className="p-3 bg-card/40 border-dashed border-border/50 text-sm text-muted-foreground">
                  Sem treinos
                </Card>
              ) : (
                <div className="space-y-2">
                  {items.map((w) => (
                    <Card key={w.id} className="p-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{w.title}</div>
                        {w.duration_min != null && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {w.duration_min} min
                          </div>
                        )}
                        {w.description && (
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                            {w.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(w);
                            setDialogOpen(true);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Excluir "${w.title}"?`)) del.mutate(w.id);
                          }}
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkoutDialogContent({
  weekIso,
  editing,
  onClose,
}: {
  weekIso: string;
  editing: Workout | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [day, setDay] = useState<number>(editing?.day_of_week ?? 0);
  const [duration, setDuration] = useState<string>(
    editing?.duration_min != null ? String(editing.duration_min) : "",
  );

  useEffect(() => {
    setTitle(editing?.title ?? "");
    setDescription(editing?.description ?? "");
    setDay(editing?.day_of_week ?? 0);
    setDuration(editing?.duration_min != null ? String(editing.duration_min) : "");
  }, [editing]);

  const save = useMutation({
    mutationFn: async () => {
      const parsed = formSchema.safeParse({
        title,
        description: description || undefined,
        day_of_week: day,
        duration_min: duration ? Number(duration) : undefined,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);

      const payload = {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        day_of_week: parsed.data.day_of_week,
        duration_min: parsed.data.duration_min ?? null,
        week_start: weekIso,
      };

      if (editing) {
        const { error } = await supabase
          .from("workouts")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("workouts")
          .insert({ ...payload, created_by: u.user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Treino atualizado" : "Treino adicionado");
      qc.invalidateQueries({ queryKey: ["admin-workouts", weekIso] });
      qc.invalidateQueries({ queryKey: ["workouts", weekIso] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Editar treino" : "Novo treino"}</DialogTitle>
      </DialogHeader>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex.: Compromised Running"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Dia</Label>
            <Select value={String(day)} onValueChange={(v) => setDay(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (min)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              max={600}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Aquecimento, série principal, volta à calma…"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Salvando…" : editing ? "Salvar alterações" : "Adicionar treino"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
