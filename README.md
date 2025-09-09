# PE4 - Sistema de Acompanhamento Acadêmico e Profissional

## 📋 Descrição do Projeto

Sistema desenvolvido para o Projeto de Extensão IV (PE4) que permite o acompanhamento acadêmico e profissional de alunos, incluindo cadastros de empresas parceiras, funções/cargos, questionários e relatórios de acompanhamento.

## 🎯 Objetivos

- Gerenciar cadastros de alunos/usuários, empresas e funcionários
- Acompanhar o período de experiência dos alunos
- Monitorar o mercado de trabalho
- Gerar relatórios de acompanhamento
- Fornecer sistema de questionários para avaliação

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Roteamento**: React Router DOM v7
- **HTTP Client**: Axios
- **Ícones**: Lucide React
- **Build Tool**: Vite

## 📁 Estrutura do Projeto

```
PE4/
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
- Node.js 18+ 
- npm ou yarn

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd PE4
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Crie um arquivo .env na raiz do projeto
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse o sistema**
   ```
   http://localhost:5173
   ```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter
- `npm run api` - Inicia a API com json-server (porta 8000)
- `npm run server` - Inicia o servidor personalizado com autenticação
- `npm run json-server` - Inicia json-server básico
- `npm run json-server-auth` - Inicia json-server com middlewares de autenticação

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🔌 API com JSON Server

Este projeto utiliza [json-server](https://github.com/typicode/json-server) para simular uma API REST completa durante o desenvolvimento.

### 🚀 Como usar a API

1. **Inicie a API**:
   ```bash
   npm run json-server
   ```

2. **A API estará disponível em**: `http://localhost:8000`

### 🔐 Autenticação

A API inclui sistema de autenticação mockado com dados pré-configurados:

**Credenciais de teste disponíveis**:
- **Admin**: `admin@empresa.com` / `admin123`
- **João Silva**: `joao@empresa.com` / `joao123`
- **Maria Santos**: `maria@empresa.com` / `maria123`

**Exemplo de login**:
```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

### 📊 Dados Mockados Disponíveis

A API fornece dados mockados completos para todas as entidades do sistema:

- **👥 Usuários**: `/users` - 3 usuários (admin + 2 usuários)
- **🎓 Alunos**: `/students` - 3 alunos com dados completos
- **🏢 Empresas**: `/companies` - 2 empresas parceiras
- **💼 Funções**: `/functions` - 4 funções/cargos disponíveis
- **👷 Funcionários**: `/employees` - 2 funcionários do sistema
- **📝 Questionários**: `/questionnaires` - 3 questionários de avaliação
- **❓ Perguntas**: `/questions` - 5 perguntas de diferentes tipos
- **✅ Respostas**: `/answers` - Respostas mockadas
- **📋 Respostas de Questionários**: `/questionnaire-responses` - 3 respostas completas
- **⭐ Avaliações de Experiência**: `/experience-evaluations` - 2 avaliações
- **📈 Acompanhamentos do Mercado**: `/job-market-follow-ups` - 2 acompanhamentos
- **📧 SMTP Config**: `/smtp-config` - Configuração de email

### 🎯 Funcionalidades Mockadas

- ✅ **CRUD completo** para todas as entidades
- ✅ **Autenticação** com JWT tokens mockados
- ✅ **Relações entre entidades** (alunos ↔ empresas, questionários ↔ perguntas, etc.)
- ✅ **Validações** e **filtros** automáticos
- ✅ **Paginação** e **ordenação** nativa do json-server
- ✅ **Busca** por texto em todos os campos
- ✅ **Sistema de recuperação de senha**
- ✅ **Configuração SMTP** para emails

### 📋 Endpoints da API

O sistema está preparado para integração com uma API REST que deve implementar os seguintes endpoints:

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário

### Cadastros
- `GET/POST/PUT/DELETE /api/students` - CRUD de alunos
- `GET/POST/PUT/DELETE /api/companies` - CRUD de empresas
- `GET/POST/PUT/DELETE /api/functions` - CRUD de funções
- `GET/POST/PUT/DELETE /api/employees` - CRUD de funcionários

### Acompanhamentos
- `GET/POST /api/experience-evaluations` - Avaliações de experiência
- `GET/POST /api/job-market-follow-ups` - Acompanhamento do mercado
- `GET/POST /api/questionnaires` - Questionários
- `GET/POST /api/questions` - Perguntas
- `GET/POST /api/answers` - Respostas

### Relatórios
- `GET /api/reports/students-by-company` - Alunos por empresa
- `GET /api/reports/students-near-termination` - Alunos próximos do desligamento

## 🧪 Testes

Para executar os testes (quando implementados):
```bash
npm test
```

## 📦 Deploy

### Build de Produção
```bash
npm run build
```

### Deploy em Servidor
1. Execute `npm run build`
2. Copie a pasta `dist` para o servidor web
3. Configure o servidor para servir o arquivo `index.html` para todas as rotas

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

**Desenvolvido com ❤️ pela equipe PE4**
