# Frontend — Nexo

SPA do sistema Nexo construída com React 19, TypeScript e Vite. Suporta PWA e empacotamento mobile via Capacitor.

## Runtime e gerenciador de dependências

**Bun é o runtime e o gerenciador de pacotes oficial deste projeto.**

- Instale dependências com `bun install` (nunca use `npm install` ou `yarn`).
- O arquivo de lock canônico é `bun.lock`. Não commite alterações em `package-lock.json`.
- Rode scripts com `bun run <script>`; binários locais via `bunx ...`.
- O dev server do Vite roda sob Bun (`bun run dev`) sem ajustes adicionais.

### Comandos principais

```bash
bun install              # instalar dependências
bun run dev              # vite dev server
bun run build            # tsc -b && vite build
bun run preview          # preview do build
bun run lint             # eslint
bun run test             # vitest run (unit/integration)
bun run test:watch       # vitest watch
bun run test:cov         # vitest run --coverage
bun run e2e              # playwright test
bun run e2e:ui           # playwright em modo UI
```

## Stack

- **React 19 + TypeScript** — UI
- **Vite 7** — bundler/dev server
- **Tailwind CSS v4** — estilo
- **React Router v7** — roteamento
- **Redux Toolkit + redux-persist** — estado global persistido
- **TanStack Query v5** — cache/fetching server-state
- **Axios** — cliente HTTP
- **Recharts / FullCalendar** — visualizações
- **Vitest + Testing Library + jsdom** — testes unitários e de integração
- **Playwright** — testes e2e (cobertura via istanbul → monocart-reporter)
- **Vite PWA + Capacitor** — PWA e build mobile

## Estrutura

```
src/
├── components/         # Componentes reutilizáveis (Layout, dashboard, etc.)
├── constants/          # Constantes e permissões por role
├── hooks/              # Hooks customizados (+ __tests__)
├── lib/                # queryClient, queryKeys, utilitários
├── pages/              # Telas (Dashboard, Login, cadastros/...)
├── services/           # api.ts (Axios), cepService, etc.
├── store/              # Redux slices (authSlice, uiSlice)
├── test/               # setup do Vitest, mocks (rechartsMock), utils
├── types/              # Tipos compartilhados
├── App.tsx
└── main.tsx
e2e/                    # Specs Playwright
```

## Política de testes — OBRIGATÓRIA

### Cobertura mínima: 90%

Configurada em `vite.config.ts` (`test.coverage.thresholds`):

```ts
thresholds: {
  lines: 90,
  functions: 90,
  branches: 85,
  statements: 90,
}
```

A meta do projeto é **≥ 90% em linhas, funções e statements**. Não rebaixe esses thresholds para fazer o CI passar — escreva o teste que falta.

Exclusões já definidas: `src/main.tsx`, `src/**/*.d.ts`, `src/assets/**`, `src/test/**`, `src/**/index.ts`.

### Toda feature ou correção exige teste

**Toda nova feature e toda correção de bug DEVE vir acompanhada de teste.**

- **Feature nova** (componente, hook, slice, service) → testes cobrindo render, interação do usuário (Testing Library + `user-event`), estados de loading/erro e branches relevantes. Para fluxos críticos de UI, adicione/atualize spec Playwright em `e2e/`.
- **Bug fix** → teste de regressão que reproduz o bug e falha antes da correção; passa depois. Sem esse teste, o PR não é mergeado.
- **Refactor** → todos os testes existentes precisam continuar verdes.

Antes de marcar uma tarefa como concluída:

1. `bun run test:cov` — confirma testes novos e cobertura ≥ 90%.
2. `bun run lint` — sem erros.
3. `bun run build` — type-check + build limpos.
4. Em mudanças de UI: rode `bun run dev`, valide o fluxo no navegador (caminho feliz + casos de borda) e cheque regressões em telas adjacentes.

### Padrões de teste

- **Unit/integration** → Vitest (`*.test.ts` / `*.test.tsx`) ao lado do código ou em `__tests__/`. Setup global em `src/test/setup.ts` (jest-dom carregado automaticamente).
- **Componentes** → Testing Library; prefira queries por role/label. Use `user-event` em vez de `fireEvent` quando possível.
- **TanStack Query** → envolva em `QueryClientProvider` com um client novo por teste (utilitário em `src/test/utils.tsx`).
- **Redux** → componente sob teste recebe um store dedicado por teste; não reutilize o store global.
- **Recharts** é mockado em `src/test/rechartsMock.tsx` para evitar custo de render do SVG.
- **E2E** → Playwright em `e2e/`. Use seletores estáveis (`data-testid` quando role/label não bastar).

## Convenções

- **TypeScript estrito**: sem `any` em código novo; tipos compartilhados moram em `src/types/`.
- **Estado servidor** via TanStack Query (`useQuery`/`useMutation`), **estado UI** via Redux slices.
- **Chaves de query** centralizadas em `src/lib/queryKeys.ts` — nunca strings soltas.
- **Tailwind v4**: utilitários por padrão; evite CSS solto fora de `App.css`/`index.css`.
- **Permissões por role** em `src/constants/rolePermissions.ts`; cheque permissão em toda rota e ação sensível.
- **CPF/CNPJ** sempre mascarados na UI.
- **PWA**: ao alterar manifest/ícones, rode `bun run generate-pwa-assets`.
- Não commite `dist/`, `node_modules/`, `coverage/`, `db.json` com dados sensíveis.
