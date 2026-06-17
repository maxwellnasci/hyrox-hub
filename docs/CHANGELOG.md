# Changelog — Hyrox Hub
> Registro cronológico de todas as mudanças do projeto.

## [Unreleased]

## [0.1.0] — 2026-06-17
### Adicionado
- Estrutura inicial do projeto gerada via Lovable
- Stack: React 19 + TanStack Start + Supabase + Tailwind v4 + Cloudflare Workers
- Autenticação com Supabase Auth (login, cadastro, role de coach via código)
- Dashboard do aluno (treinos da semana, check-in, progresso)
- Painel do coach (CRUD de treinos, lista de alunos)
- Landing page pública
- CI/CD configurado (.github/workflows)
- README.md no padrão de portfólio com screenshots
- Documentação completa: ARCHITECTURE.md, DATABASE.md, CHANGELOG.md, AI-CONTEXT.md
- 3 migrations aplicadas no Supabase (user_roles, workouts, workout_completions, profiles)
- Deploy no Cloudflare Workers — https://hyrox-hub.maxwellngg.workers.dev
- Chaves do Supabase rotacionadas e .env removido do rastreamento git
- Screenshots da landing, cadastro e login no README
