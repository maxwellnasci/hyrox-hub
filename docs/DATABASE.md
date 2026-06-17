# Banco de Dados — Hyrox Hub
> Documento vivo. Atualizado a cada migration aplicada.

## Tabelas

### user_roles
Controle de permissões dos usuários.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| user_id | UUID | FK → auth.users |
| role | app_role | 'admin' ou 'student' |
| created_at | TIMESTAMPTZ | Data de criação |

### workouts
Treinos criados pelo coach.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| title | TEXT | Título do treino |
| description | TEXT | Descrição |
| day_of_week | SMALLINT | 0=Dom … 6=Sáb |
| week_start | DATE | Início da semana |
| duration_min | INTEGER | Duração em minutos |
| created_by | UUID | FK → auth.users |

### workout_completions
Check-ins dos alunos.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | PK |
| workout_id | UUID | FK → workouts |
| user_id | UUID | FK → auth.users |
| completed_at | TIMESTAMPTZ | Data do check-in |

### profiles
Perfil público dos usuários.
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| user_id | UUID | PK + FK → auth.users |
| email | TEXT | Email |
| display_name | TEXT | Nome exibido |

## Segurança
- RLS habilitado em todas as tabelas
- Funções SECURITY DEFINER com search_path fixo
- Permissões revogadas de PUBLIC, anon e authenticated nas funções internas

## Status das Migrations
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| 20260511230824 | Roles, workouts, completions | ⏳ Pendente |
| 20260511230848 | Fix search_path + revoke permissions | ⏳ Pendente |
| 20260512084024 | Seed usuário admin | ⏳ Pendente |
| 20260512084827 | ⚠️ Limpeza destrutiva — NÃO rodar em produção | 🚫 Ignorar |
| 20260512101500 | Tabela profiles + função is_admin | ⏳ Pendente |
