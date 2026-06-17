# Contexto para IAs — Hyrox Hub
> Este arquivo existe para que qualquer IA consiga entender o projeto rapidamente e continuar o trabalho de onde parou.

## O que é este projeto
App web de treinos focado na modalidade Hyrox. Coaches gerenciam treinos semanais, alunos visualizam, fazem check-in e acompanham o progresso. Visual dark premium.

## Time de desenvolvimento
| Agente | Papel |
|--------|-------|
| Maxwell | Product Owner e decisões finais |
| Claude (claude.ai) | Estratégia, arquitetura e documentação |
| Gemini 2.5 Pro (Antigravity) | Execução, terminal e código |
| Claude Sonnet 4.6 think (Antigravity) | Análises profundas pontuais |
| DeepSeek (subagente) | Análise técnica via Gemini |

## Fluxo de trabalho
1. Maxwell + Claude definem o que fazer e como
2. Claude gera o prompt com instruções detalhadas
3. Gemini executa no terminal e retorna o resultado
4. Claude analisa e define próximos passos
5. Gemini commita e faz push no GitHub

## Onde estão as decisões
- Estratégia e planejamento → docs/MVP-PLAN.md
- Arquitetura técnica → docs/ARCHITECTURE.md
- Banco de dados → docs/DATABASE.md
- Histórico de mudanças → docs/CHANGELOG.md

## Estado atual do projeto
- Banco Supabase: ativo com 4 tabelas (user_roles, workouts, workout_completions, profiles)
- Migrations: 3 aplicadas, 1 ignorada (destrutiva), 1 pulada (seed manual)
- Frontend: estrutura completa, rotas funcionando
- Deploy: https://hyrox-hub.maxwellngg.workers.dev (Cloudflare Workers)
- README: completo com screenshots, URL de produção e badges
- Score estimado: 55/100 → meta MVP: 75/100

## Próximos passos
1. Testar fluxo completo (criar conta coach + criar treinos + criar conta aluno + check-in)
2. Melhorias no dashboard do aluno (gráficos, streaks)
3. Melhorias no painel do coach (grid de 4 semanas)
4. PWA (instalável no celular)
