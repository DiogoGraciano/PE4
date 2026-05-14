# Backend — Nexo

API REST do sistema Nexo construída com NestJS, TypeORM e PostgreSQL.

## Runtime e gerenciador de dependências

**Bun é o runtime e o gerenciador de pacotes oficial deste projeto.**

- Instale dependências com `bun install` (nunca use `npm install` ou `yarn`).
- O arquivo de lock canônico é `bun.lock`. Não commite alterações em `package-lock.json`.
- Execute scripts com `bun run <script>` ou diretamente `bun <arquivo>`.
- Para rodar a CLI do Nest sem instalação global use `bunx @nestjs/cli ...`.

### Comandos principais

```bash
bun install              # instalar dependências
bun run start:dev        # dev server com watch
bun run build            # build de produção (nest build)
bun run start:prod       # rodar build
bun run test             # rodar testes (jest)
bun run test:cov         # testes com relatório de cobertura
bun run test:e2e         # testes e2e
bun run lint             # eslint --fix
bun run seed             # popular banco
bun run migrate:fresh    # recriar schema do zero
```

## Stack

- **NestJS 11** — framework HTTP modular
- **TypeORM 0.3** — ORM para PostgreSQL
- **PostgreSQL 15+** — banco relacional
- **JWT + Passport** — autenticação
- **class-validator / class-transformer** — validação de DTOs
- **Nodemailer** — envio de e-mails
- **Jest** — runner de testes
- **Swagger** — documentação automática da API

## Estrutura

```
src/
├── auth/                       # Autenticação JWT/Passport
├── companies/                  # Empresas parceiras
├── config/                     # Configurações (excluídas da cobertura)
├── database/                   # Migrations/seeders (excluídos da cobertura)
├── employees/                  # Funcionários
├── events/                     # Eventos da agenda
├── functions/                  # Funções/cargos
├── questionnaire-responses/    # Respostas completas
├── questionnaires/             # Templates de questionários
├── questions/                  # Perguntas
├── referrals/                  # Encaminhamentos
├── reports/                    # Relatórios
├── smtp-config/                # Configuração SMTP
├── students/                   # Alunos
├── app.module.ts
└── main.ts
```

Cada módulo segue o padrão NestJS: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `dto/`, `*.service.spec.ts`.

## Política de testes — OBRIGATÓRIA

### Cobertura mínima: 90%

Os testes devem manter **no mínimo 90% de cobertura** em linhas, funções, branches e statements para o código de produção. Configurado em `package.json` (`jest.coverageThreshold`):

```json
"coverageThreshold": {
  "global": {
    "branches": 90,
    "functions": 90,
    "lines": 90,
    "statements": 90
  }
}
```

Não rebaixe esses thresholds para fazer o CI passar — escreva o teste que falta.

Arquivos excluídos da cobertura (já configurados em `collectCoverageFrom`): `*.module.ts`, `*.controller.ts`, `main.ts`, `database/**`, `config/**`, `*.entity.ts`, `*.dto.ts`, `decorators/**`.

### Toda feature ou correção exige teste

**Toda nova feature e toda correção de bug DEVE vir acompanhada de teste.**

- **Feature nova** → spec cobrindo caminho feliz, validações e erros esperados.
- **Bug fix** → teste de regressão que falha antes da correção e passa depois. Sem esse teste, o PR não é mergeado.
- **Refactor** → testes existentes precisam continuar passando; adicione casos se a refatoração expuser caminhos antes não cobertos.

Antes de marcar uma tarefa como concluída, rode `bun run test:cov` e confirme que:
1. Os novos testes existem e passam.
2. A cobertura global permanece ≥ 90%.
3. O lint passa (`bun run lint`).

### Padrões de teste

- Testes unitários ficam ao lado do código: `foo.service.ts` ↔ `foo.service.spec.ts`.
- Testes e2e ficam em `test/` e usam o config `test/jest-e2e.json`.
- Mocke o repositório TypeORM com `getRepositoryToken(Entity)` ao testar services.
- Para controllers, prefira testar via e2e (eles estão excluídos da cobertura unitária).

## Variáveis de ambiente

Veja `_.env` como referência. Variáveis obrigatórias:

```
NODE_ENV, PORT
DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_EXPIRES_IN
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
FRONTEND_URL
```

## Convenções

- Use DTOs com `class-validator` em toda entrada HTTP — nunca aceite `any` no controller.
- Senhas sempre via `bcrypt`, nunca em claro nos logs.
- Endpoints autenticados por padrão; marque explicitamente o que for público com `@Public()`.
- Erros de domínio devem usar as exceptions do Nest (`NotFoundException`, `BadRequestException`, etc.).
- Não commite `.env`, `dist/`, `coverage/`, `node_modules/`.
