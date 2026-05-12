# Willoe QA Agents

Drie sub-agents die elke wijziging controleren voordat hij naar Willem gaat.

## De agents

| Agent | Wanneer | Wat |
|---|---|---|
| **willoe-frontend** | Na elke wijziging in `web/src/app/**` of `web/src/components/**` | TS compile, design tokens, sidebar↔routes match, console.logs, a11y |
| **willoe-backend** | Na elke wijziging in `web/src/app/api/**`, `web/src/lib/**`, `drizzle/**`, `.env*` | TS compile, secret leaks, env() helper usage, error handling, RLS coverage, client/server boundary |
| **willoe-qa** | Sessie-eind of na grote features | Invoke beide bovenstaande + e2e: build, live routes, API smoke tests, Supabase, auth |

## Hoe ze ingezet worden

De hoofd-Claude (main session) roept ze automatisch aan via de Agent tool:

```
Agent({ subagent_type: "willoe-frontend", prompt: "Check de portal/billing wijziging" })
```

Willem kan ze ook handmatig invoken in elke nieuwe sessie door te vragen "draai willoe-qa".

## Wanneer welke?

- **Kleine UI tweak** → willoe-frontend
- **Nieuw API endpoint** → willoe-backend
- **Allebei tegelijk gewijzigd** → willoe-qa (die roept beide aan)
- **Auth flow gebouwd, nieuwe integratie, nieuwe pagina-set** → willoe-qa
- **Voor de session-summary aan Willem** → willoe-qa

## Output format

Alle drie agents geven gestructureerde markdown rapporten met:
- ✅ Passed N checks
- ❌ Failed N checks (met file:line)
- 💡 Concrete fix suggesties
- ⚠️ Warnings (niet-blocking)

Geen vrijblijvende prozaverhalen — alleen pass/fail + actie.
