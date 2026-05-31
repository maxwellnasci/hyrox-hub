# Hyrox Hub — Plano MVP (validação com cliente)

> Objetivo: app web de treinos Hyrox (coach + aluno) com visual premium (dark + laranja Strava-like), stack moderna e repo seguro para portfolio no GitHub.
>
> Após validação com o cliente → Fase 5 (entrega final).

## Estado inicial (~38/100)

| Área               | Nota |
| ------------------ | ---- |
| Stack moderna      | 85   |
| MVP funcional      | 58   |
| Design premium     | 32   |
| Portfolio / GitHub | 22   |

## Escopo MVP (o que entra vs o que fica para depois)

### ✅ Entra no MVP (validação cliente)

- [x] Auth email/senha (login, cadastro, coach via código)
- [x] Dashboard aluno — semana, check-ins, progresso
- [x] Painel coach — CRUD treinos + lista alunos
- [x] Landing page pública
- [x] Polish visual (skeletons, marca, microinterações)
- [x] Segurança repo (`.env` ignorado, `.env.example`, docs)
- [x] README + CI (lint/build)
- [ ] Deploy demo (Cloudflare) — link no README

### ⏳ Pós-validação (Fase 5 — entrega)

- Perfil editável (`display_name`)
- Convite de alunos por link/código
- Gráficos multi-semana (recharts)
- Reset de senha / OAuth
- Programa por coach (multi-tenant)
- Testes E2E (Playwright)
- Limpeza migrations destrutivas do histórico
- PWA / mobile-first refinado

---

## Etapas e commits

| Etapa | Branch/commit                      | Entregável                                                   |
| ----- | ---------------------------------- | ------------------------------------------------------------ |
| **1** | `chore: security and project docs` | ✅ `.gitignore`, `.env.example`, `README.md`, rename projeto |
| **2** | `ci: lint and build on push`       | ✅ `.github/workflows/ci.yml`                                |
| **3** | `feat: landing page and brand`     | ✅ `/` marketing, `BrandLogo`                                |
| **4** | `feat: mvp visual polish`          | ✅ Skeletons, auth layout, admin AlertDialog                 |
| **5** | `chore: deploy demo`               | Cloudflare + URL no README                                   |

---

## Segurança (checklist)

- [x] `.env` no `.gitignore` (nunca commitar chaves Supabase)
- [x] `.env.example` sem valores reais
- [ ] `SUPABASE_SERVICE_ROLE_KEY` só no servidor (Cloudflare secrets)
- [ ] `COACH_INVITE_CODE` só em variável de ambiente server-side
- [ ] RLS ativo em todas as tabelas (já implementado)
- [ ] Migrations destrutivas (`DELETE FROM auth.users`) **não** rodar em produção

### Variáveis de ambiente

| Variável                        | Onde         | Obrigatório    |
| ------------------------------- | ------------ | -------------- |
| `VITE_SUPABASE_URL`             | Client + SSR | Sim            |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client + SSR | Sim            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only  | Coach signup   |
| `COACH_INVITE_CODE`             | Server only  | Promoção admin |

---

## Stack

- **Frontend:** TanStack Start, React 19, TanStack Router/Query
- **UI:** Tailwind v4, shadcn/ui, Lucide
- **Backend:** Supabase (Auth + Postgres + RLS)
- **Deploy:** Cloudflare Workers (Wrangler)

---

## Critérios de aceite — demo cliente

1. Coach cria treinos da semana no painel admin
2. Aluno vê treinos, marca como feito, vê % da semana
3. Landing explica o produto; login/cadastro funcionam
4. App responsivo (mobile + desktop)
5. Repo no GitHub com README, CI verde, sem secrets expostos

---

## Próximo passo após OK do cliente

Ver seção **Fase 5** acima. Priorizar: convite alunos → perfil → gráficos → deploy produção.
