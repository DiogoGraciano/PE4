# Database Seeders

Este diretório contém os seeders e factories para popular o banco de dados com dados iniciais.

## Estrutura

- **`data-source.ts`**: Configuração do DataSource para os seeders
- **`run-seeders.ts`**: Script para executar os seeders
- **`seeds/`**: Diretório com os seeders de cada módulo
- **`factories/`**: Diretório com as factories para gerar dados aleatórios

## Seeders Disponíveis

1. **FunctionSeeder** - Popula funções (ADM, PROF, COORD, RH, DIR)
2. **CompanySeeder** - Popula empresas parceiras
3. **EmployeeSeeder** - Popula funcionários (inclui admin e professor padrão)
4. **StudentSeeder** - Popula alunos
5. **QuestionnaireSeeder** - Popula questionários
6. **QuestionSeeder** - Popula perguntas dos questionários
7. **SmtpConfigSeeder** - Popula configuração SMTP padrão
8. **MainSeeder** - Executa todos os seeders na ordem correta

## Executando os Seeders

### Executar todos os seeders:
```bash
npm run seed
```

ou

```bash
npm run seed:run
```

### Credenciais Padrão Criadas

Após executar os seeders, você terá os seguintes usuários criados:

- **Admin**: 
  - Email: `admin@pe4.com`
  - Senha: `admin123`

- **Professor**: 
  - Email: `professor@pe4.com`
  - Senha: `prof123`

## Dependências

Os seeders respeitam a ordem de dependências entre as entidades:

1. Functions → deve ser executado primeiro
2. Companies → pode ser executado em paralelo com Functions
3. Employees → depende de Functions
4. Students → depende de Companies e Functions
5. Questionnaires → pode ser executado independentemente
6. Questions → depende de Questionnaires
7. SmtpConfig → pode ser executado independentemente

O `MainSeeder` executa todos na ordem correta automaticamente.

