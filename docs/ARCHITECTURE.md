# Arquitetura — Hyrox Hub
> Documento vivo. Atualizado a cada mudança estrutural do projeto.

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite + TanStack Start |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Backend | Supabase (Postgres + Auth + RLS) |
| Deploy | Cloudflare Workers (Wrangler) |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |

## Estrutura de Pastas
hyrox-hub/

src/

components/     # Componentes reutilizáveis e shadcn/ui

hooks/          # Hooks customizados (auth, mobile)

integrations/   # Cliente e configurações do Supabase

lib/            # Funções helpers e utilitários

routes/         # Páginas baseadas no TanStack Router

supabase/

migrations/     # Migrations SQL do banco de dados

docs/             # Documentação do projeto

.github/

workflows/      # CI/CD (lint + build)

## Rotas
| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/login` | Autenticação |
| `/signup` | Cadastro |
| `/_authenticated/dashboard` | Dashboard do aluno |
| `/_authenticated/admin` | Painel do coach |
