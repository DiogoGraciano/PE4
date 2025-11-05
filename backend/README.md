# PE4 Backend - API NestJS

Backend da aplicação PE4, desenvolvido com NestJS, TypeORM e PostgreSQL.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação
- **class-validator** - Validação de dados
- **Nodemailer** - Envio de emails
- **Docker** - Containerização

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ (ou Docker)
- npm ou yarn

## 🔧 Instalação

### Opção 1: Com Docker (Recomendado)

1. Clone o repositório
```bash
git clone <seu-repositorio>
cd backend
```

2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Inicie os containers
```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:3000`

### Opção 2: Instalação Manual

1. Instale as dependências
```bash
npm install
```

2. Configure o banco de dados PostgreSQL e crie um database

3. Configure as variáveis de ambiente no arquivo `.env`

4. Execute as migrations (o TypeORM irá criar as tabelas automaticamente no modo desenvolvimento)

5. Inicie a aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 🗄️ Estrutura do Banco de Dados

O projeto possui as seguintes entidades:

- **Funcionários** (funcionarios) - Usuários do sistema
- **Alunos** (alunos) - Estudantes cadastrados
- **Empresas** (empresas) - Empresas parceiras
- **Funções** (funcoes) - Cargos/funções
- **Questionários** (questionarios) - Templates de questionários
- **Perguntas** (perguntas) - Perguntas dos questionários
- **Respostas** (respostas) - Respostas individuais
- **Respostas de Questionários** (respostas_questionarios) - Respostas completas
- **Configuração SMTP** (smtp_configs) - Configurações de email

## 📚 Endpoints da API

### Autenticação

- `POST /auth` - Login
- `POST /auth/logout` - Logout
- `POST /forgot-password` - Solicitar recuperação de senha
- `POST /reset-password` - Redefinir senha

### Funcionários

- `GET /employees` - Listar funcionários
- `GET /employees/:id` - Buscar funcionário
- `POST /employees` - Criar funcionário (público)
- `PUT /employees/:id` - Atualizar funcionário
- `DELETE /employees/:id` - Remover funcionário

### Alunos

- `GET /students` - Listar alunos
- `GET /students/:id` - Buscar aluno
- `POST /students` - Criar aluno
- `PUT /students/:id` - Atualizar aluno
- `DELETE /students/:id` - Remover aluno

### Empresas

- `GET /companies` - Listar empresas
- `GET /companies/:id` - Buscar empresa
- `POST /companies` - Criar empresa
- `PUT /companies/:id` - Atualizar empresa
- `DELETE /companies/:id` - Remover empresa

### Funções

- `GET /functions` - Listar funções
- `GET /functions/:id` - Buscar função
- `POST /functions` - Criar função
- `PUT /functions/:id` - Atualizar função
- `DELETE /functions/:id` - Remover função

### Questionários

- `GET /questionnaires` - Listar questionários
- `GET /questionnaires/:id` - Buscar questionário
- `POST /questionnaires` - Criar questionário
- `PUT /questionnaires/:id` - Atualizar questionário
- `DELETE /questionnaires/:id` - Remover questionário

### Perguntas

- `GET /questions` - Listar perguntas
- `GET /questions?questionnaire_id=:id` - Listar perguntas por questionário
- `GET /questions/:id` - Buscar pergunta
- `POST /questions` - Criar pergunta
- `PUT /questions/:id` - Atualizar pergunta
- `DELETE /questions/:id` - Remover pergunta

### Respostas

- `GET /answers` - Listar respostas
- `GET /answers/:id` - Buscar resposta
- `POST /answers` - Criar resposta
- `PUT /answers/:id` - Atualizar resposta
- `DELETE /answers/:id` - Remover resposta

### Respostas de Questionários

- `GET /questionnaire-responses` - Listar respostas
- `GET /questionnaire-responses?questionnaire_id=:id` - Listar por questionário
- `GET /questionnaire-responses/:id` - Buscar resposta
- `POST /questionnaire-responses` - Criar resposta
- `PUT /questionnaire-responses/:id` - Atualizar resposta
- `DELETE /questionnaire-responses/:id` - Remover resposta

### Configuração SMTP

- `GET /smtp-config` - Buscar configuração SMTP
- `POST /smtp-config` - Salvar configuração SMTP
- `POST /smtp-config-test` - Testar conexão SMTP

## 🔐 Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Após o login, inclua o token no header das requisições:

```
Authorization: Bearer <seu-token>
```

Endpoints públicos (não requerem autenticação):
- POST /auth
- POST /employees (cadastro)
- POST /forgot-password
- POST /reset-password

## 🔧 Variáveis de Ambiente

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=pe4_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@pe4.com

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev

# Build
npm run build

# Produção
npm run start:prod

# Testes
npm run test

# Linting
npm run lint
```

## 🐳 Docker

### Comandos Docker úteis

```bash
# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Reconstruir containers
docker-compose up -d --build

# Acessar banco de dados
docker-compose exec postgres psql -U postgres -d pe4_db
```

## 📦 Estrutura de Pastas

```
backend/
├── src/
│   ├── config/          # Configurações
│   ├── entities/        # Entidades TypeORM
│   ├── modules/         # Módulos da aplicação
│   │   ├── auth/        # Autenticação
│   │   ├── employees/   # Funcionários
│   │   ├── students/    # Alunos
│   │   ├── companies/   # Empresas
│   │   ├── functions/   # Funções
│   │   ├── questionnaires/
│   │   ├── questions/
│   │   ├── answers/
│   │   ├── questionnaire-responses/
│   │   └── smtp-config/
│   ├── app.module.ts    # Módulo principal
│   └── main.ts          # Entry point
├── test/                # Testes
├── .env                 # Variáveis de ambiente
├── docker-compose.yml   # Configuração Docker
├── Dockerfile          # Dockerfile
└── package.json        # Dependências
```

## 🛠️ Desenvolvimento

### Criar novo módulo

```bash
nest g module modules/nome-modulo
nest g controller modules/nome-modulo
nest g service modules/nome-modulo
```

### Criar nova entidade

```bash
nest g class entities/nome-entidade --no-spec
```

## 🐛 Troubleshooting

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Se usando Docker, verifique se o container está ativo: `docker-compose ps`

### Erro de autenticação
- Verifique se o JWT_SECRET está configurado
- Confirme se o token está sendo enviado no header correto

### Erro ao enviar email
- Configure corretamente as credenciais SMTP
- Para Gmail, use uma senha de aplicativo
- Teste a conexão com `/smtp-config-test`

## 📄 Licença

Este projeto é privado e não possui licença pública.

## 👥 Autores

Desenvolvido pela equipe PE4
