# Nexo - Sistema de Acompanhamento Acadêmico e Profissional

## 📋 Descrição do Projeto

Sistema **Nexo** para acompanhamento acadêmico e profissional de alunos, incluindo cadastros de empresas parceiras, funções/cargos, questionários e relatórios de acompanhamento.

## 🎯 Objetivos

- Gerenciar cadastros de alunos/usuários, empresas e funcionários
- Acompanhar o período de experiência dos alunos
- Monitorar o mercado de trabalho
- Gerar relatórios de acompanhamento
- Fornecer sistema de questionários para avaliação

## 🚀 Tecnologias Utilizadas

- **Runtime / Package Manager**: [Bun](https://bun.sh) (oficial — não use `npm`/`yarn`; lockfile canônico é `bun.lock`)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Roteamento**: React Router DOM v7
- **Estado global**: Redux Toolkit + redux-persist
- **Server state**: TanStack Query v5
- **HTTP Client**: Axios
- **Ícones**: Lucide React
- **Build Tool**: Vite 7
- **Testes**: Vitest + Testing Library (unit/integration) e Playwright (e2e)
- **PWA / Mobile**: Vite PWA + Capacitor

## 📁 Estrutura do Projeto

```
nexo/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── Layout.tsx      # Layout principal com menu lateral
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── pages/              # Páginas do sistema
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── Login.tsx       # Tela de login
│   │   └── cadastros/      # Páginas de cadastros
│   │       ├── Students.tsx
│   │       ├── Companies.tsx
│   │       └── Functions.tsx
│   ├── services/            # Serviços de API
│   │   └── api.ts          # Cliente Axios configurado
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts        # Interfaces e tipos
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Ponto de entrada
├── public/                  # Arquivos estáticos
├── package.json            # Dependências e scripts
└── README.md               # Este arquivo
```

## 🎨 Identidade Visual

- **Paleta de Cores**: Azul e Vermelho (conforme especificação)
- **Layout**: Menu lateral fixo à esquerda
- **Design**: Interface moderna e responsiva usando Tailwind CSS v4

## 🔐 Funcionalidades de Segurança

- **Autenticação**: JWT com interceptors Axios
- **Validação de Senha**: Complexidade obrigatória (8+ chars, maiúsculas, minúsculas, números, especiais)
- **Proteção de Rotas**: Middleware de autenticação
- **Mascaramento**: CPF e CNPJ nunca exibidos sem máscara
- **Logs de Auditoria**: Preparado para implementação

## 📊 Módulos do Sistema

### 1. Módulo Cadastros
- **Alunos/Usuários**: Cadastro completo com validações
- **Empresas**: Cadastro com validação de CNPJ
- **Funcionários**: Gestão de funcionários do sistema
- **Funções**: Cargos e funções disponíveis
- **Questionários**: Sistema de perguntas e respostas

### 2. Módulo Acompanhamentos
- **Respostas de Questionários**: Avaliações dos alunos
- **Avaliação do Período de Experiência**: Acompanhamento do estágio
- **Acompanhamento do Mercado de Trabalho**: Visitas e pareceres

### 3. Módulo Relatórios
- **Alunos por Empresa**: Distribuição de alunos por empresa
- **Alunos Próximos do Desligamento**: Alertas de desligamento

## 🛠️ Instalação e Configuração

### Pré-requisitos
- [Bun](https://bun.sh) ≥ 1.x

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd nexo/frontend
   ```

2. **Instale as dependências**
   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Crie um arquivo .env na raiz do projeto frontend
   VITE_API_URL=http://localhost:3000
   ```

4. **Execute o projeto**
   ```bash
   bun run dev
   ```

5. **Acesse o sistema**
   ```
   http://localhost:5173
   ```

## 🔧 Scripts Disponíveis

```bash
bun install              # Instala dependências (gera/usa bun.lock)
bun run dev              # Servidor de desenvolvimento (Vite)
bun run build            # Build de produção (tsc -b && vite build)
bun run preview          # Pré-visualiza o build
bun run lint             # ESLint
bun run test             # Testes unitários/integração (Vitest)
bun run test:watch       # Vitest em modo watch
bun run test:cov         # Testes + cobertura (meta: ≥ 90%)
bun run e2e              # Testes end-to-end (Playwright)
bun run e2e:ui           # Playwright em modo UI
bun run generate-pwa-assets  # Gera ícones do PWA
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🔌 Backend / API

A API consumida pelo frontend é o serviço NestJS em [`../backend`](../backend). Suba o backend (via Docker ou local) antes de rodar o frontend e aponte `VITE_API_URL` para a URL da API (`http://localhost:3000` por padrão).

Documentação interativa (Swagger): `http://localhost:3000/api` com o backend em execução.

## 🧪 Testes

### Política do projeto

- **Cobertura mínima de 90%** em linhas, funções e statements. Threshold configurado em [`vite.config.ts`](vite.config.ts) (`test.coverage.thresholds`). Não rebaixe esses valores para fazer o CI passar — escreva o teste que falta.
- **Toda nova feature e toda correção de bug DEVE vir acompanhada de teste.** Em bug fixes, inclua o teste de regressão que falha antes do fix e passa depois.

### Stack

- **Unit / integration**: [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + jsdom. Arquivos `*.test.ts` / `*.test.tsx` ao lado do código ou em `__tests__/`.
- **E2E**: [Playwright](https://playwright.dev) em [`e2e/`](e2e/). Cobertura coletada via [`vite-plugin-istanbul`](https://github.com/iFaxity/vite-plugin-istanbul) e reportada pelo [`monocart-reporter`](https://github.com/cenfun/monocart-reporter).

### Comandos

```bash
bun run test             # roda toda a suíte Vitest
bun run test:watch       # watch mode
bun run test:cov         # cobertura (HTML em coverage/, lcov para CI)
bun run e2e              # Playwright headless
bun run e2e:ui           # Playwright modo UI
bun run e2e:install      # baixa o Chromium do Playwright (primeira vez)
```

### Antes de abrir um PR

1. `bun run test:cov` — testes novos passam e cobertura permanece ≥ 90%.
2. `bun run lint` — sem erros.
3. `bun run build` — type-check + build limpos.
4. Em mudanças de UI, valide no navegador (caminho feliz + casos de borda).

Mais detalhes operacionais em [CLAUDE.md](CLAUDE.md).

## 📦 Deploy

### Build de Produção
```bash
bun run build
```

### Deploy em Servidor
1. Execute `bun run build`
2. Copie a pasta `dist` para o servidor web
3. Configure o servidor para servir o arquivo `index.html` para todas as rotas (SPA fallback)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos como parte do Projeto de Extensão IV.

## 👥 Equipe

- **Diogo Graciano**
- **Priscila Santinoni**
- **Luiz Gabriel Boeing**

## 📅 Cronograma

- **25/08/2025** – Atividade 01: Documentação dos requisitos ✅
- **15/09/2025** – Atividade 02: Apresentação da prototipação ✅
- **13/10/2025** – Atividade 03: Apresentação das telas implementadas ✅
- **10/11/2025** – Atividade 04: Entrega e apresentação final do aplicativo

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte os issues do projeto
3. Entre em contato com a equipe

---

**Desenvolvido com ❤️ pela equipe Nexo**
