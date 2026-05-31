# Hyrox Hub

App web de treinos Hyrox para coaches e alunos — visual dark premium, check-ins semanais e painel do treinador.

## Stack

- [TanStack Start](https://tanstack.com/start) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Auth, Postgres, RLS)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) (deploy)

## Funcionalidades (MVP)

- **Aluno:** visualizar treinos da semana, marcar conclusão, acompanhar progresso %
- **Coach:** criar/editar/remover treinos, ver lista de alunos
- **Auth:** cadastro, login, promoção a coach via código de convite

## Setup local

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Preencher com credenciais do projeto Supabase

# Desenvolvimento
npm run dev
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (apenas server — claim coach) |
| `COACH_INVITE_CODE` | Código secreto para virar coach no cadastro |

> **Segurança:** nunca commite o arquivo `.env`. Use secrets no Cloudflare para produção.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estrutura

```
src/
  routes/           # Páginas (TanStack Router file-based)
  components/ui/    # shadcn/ui
  integrations/     # Supabase client
  lib/              # Server functions, helpers
supabase/
  migrations/       # Schema Postgres + RLS
docs/
  MVP-PLAN.md       # Roadmap MVP → entrega cliente
```

## Deploy (Cloudflare)

```bash
npm run build
npx wrangler deploy
```

Configure secrets no Cloudflare: `SUPABASE_SERVICE_ROLE_KEY`, `COACH_INVITE_CODE`.

## Roadmap

Ver [docs/MVP-PLAN.md](./docs/MVP-PLAN.md) para etapas, checklist de segurança e critérios de aceite.

## Licença

Privado — portfolio / demo cliente.
