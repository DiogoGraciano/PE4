# Guia de Configuração - Nexo Backend

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto backend (ou copie do `.env.example`):

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nexo_db

# JWT
JWT_SECRET=mude-esta-chave-secreta-em-producao
JWT_EXPIRES_IN=7d

# SMTP (Configure com suas credenciais)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-aplicativo
SMTP_FROM=noreply@nexo.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Iniciar o Projeto

#### Opção A: Com Docker (Recomendado)

```bash
# Inicia PostgreSQL e a aplicação
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

#### Opção B: Sem Docker

1. Certifique-se de que o PostgreSQL está instalado e rodando
2. Crie o banco de dados:

```sql
CREATE DATABASE nexo_db;
```

3. Inicie a aplicação:

```bash
npm run start:dev
```

### 4. Criar Primeiro Usuário (Administrador)

Após a aplicação iniciar, as tabelas serão criadas automaticamente. Para criar o primeiro usuário administrador, você pode:

#### Opção 1: Via API

Faça uma requisição POST para `/employees`:

```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Administrador",
    "email": "admin@nexo.com",
    "telefone": "11999999999",
    "cpf": "12345678901",
    "senha": "admin123",
    "cep": "01310-100",
    "cidade": "São Paulo",
    "estado": "SP",
    "bairro": "Bela Vista",
    "pais": "Brasil",
    "numero_endereco": "1000",
    "complemento": "Sala 1"
  }'
```

#### Opção 2: Via Interface do Frontend

1. Acesse a página de cadastro no frontend
2. Preencha o formulário de cadastro
3. O primeiro usuário cadastrado terá acesso total ao sistema

### 5. Fazer Login

Após criar o usuário, faça login:

```bash
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nexo.com",
    "password": "admin123"
  }'
```

Você receberá um token JWT que deve ser usado nas requisições subsequentes:

```json
{
  "user": {
    "id": 1,
    "nome": "Administrador",
    "email": "admin@nexo.com",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6. Configurar SMTP (Opcional)

Para habilitar o envio de emails de recuperação de senha:

1. Acesse `/smtp-config` (necessário estar autenticado)
2. Configure suas credenciais SMTP
3. Teste a conexão com `/smtp-config-test`

#### Para Gmail:

1. Ative a verificação em duas etapas
2. Gere uma senha de aplicativo em: https://myaccount.google.com/apppasswords
3. Use a senha de aplicativo no campo `SMTP_PASSWORD`

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo de desenvolvimento
npm run start:dev

# Ver logs em tempo real
npm run start:dev | grep -v "LOG"

# Build da aplicação
npm run build

# Iniciar em modo de produção
npm run start:prod
```

### Docker

```bash
# Iniciar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Acessar o container do backend
docker-compose exec backend sh

# Acessar o PostgreSQL
docker-compose exec postgres psql -U postgres -d nexo_db

# Reconstruir imagens
docker-compose up -d --build
```

### Banco de Dados

```bash
# Acessar PostgreSQL (se instalado localmente)
psql -U postgres -d nexo_db

# Ver tabelas
\dt

# Ver estrutura de uma tabela
\d funcionarios

# Sair do psql
\q
```

## 📊 Testando a API

### 1. Criar Função

```bash
curl -X POST http://localhost:3000/functions \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "DEV",
    "nome_funcao": "Desenvolvedor"
  }'
```

### 2. Criar Empresa

```bash
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razao_social": "Empresa Exemplo LTDA",
    "cnpj": "12345678000190",
    "cep": "01310-100",
    "cidade": "São Paulo",
    "estado": "SP",
    "bairro": "Bela Vista",
    "pais": "Brasil",
    "numero_endereco": "1000"
  }'
```

### 3. Criar Aluno

```bash
curl -X POST http://localhost:3000/students \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ALU001",
    "responsavel": "Maria Silva",
    "observacao": "Aluno exemplar"
  }'
```

### 4. Criar Questionário

```bash
curl -X POST http://localhost:3000/questionnaires \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Avaliação Inicial",
    "questionario_json": "{\"fields\":[{\"id\":\"q1\",\"type\":\"input\",\"label\":\"Nome completo\"}]}"
  }'
```

## 🐛 Resolução de Problemas

### Erro: "Cannot find module '@nestjs/mapped-types'"

```bash
npm install @nestjs/mapped-types
```

### Erro: "connect ECONNREFUSED 127.0.0.1:5432"

O PostgreSQL não está rodando ou as credenciais estão incorretas. Verifique:
- PostgreSQL está instalado e rodando
- Credenciais no `.env` estão corretas
- Se usando Docker: `docker-compose ps` para ver se os containers estão ativos

### Erro: "Nest can't resolve dependencies"

Limpe e reinstale as dependências:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 is already in use"

Mude a porta no arquivo `.env`:

```env
PORT=3001
```

### Erro ao enviar email

1. Verifique as credenciais SMTP no `.env`
2. Para Gmail, use senha de aplicativo
3. Teste a conexão: POST `/smtp-config-test`

## 📝 Próximos Passos

1. ✅ Configure o ambiente de desenvolvimento
2. ✅ Crie o primeiro usuário administrador
3. ✅ Teste os endpoints principais
4. ✅ Configure o SMTP para recuperação de senha
5. 🔄 Integre com o frontend
6. 🔄 Implemente testes
7. 🔄 Configure CI/CD
8. 🔄 Deploy em produção

## 📚 Documentação Adicional

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 💡 Dicas

1. **Segurança**: Mude o `JWT_SECRET` para um valor seguro em produção
2. **Backup**: Configure backups regulares do banco de dados
3. **Logs**: Use um serviço de logging em produção (ex: Winston, Sentry)
4. **Performance**: Configure índices nas tabelas mais consultadas
5. **Testes**: Escreva testes para os endpoints críticos

## 🤝 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

