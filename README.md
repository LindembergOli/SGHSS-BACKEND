# SGHSS Backend

**Sistema de Gestão Hospitalar e de Serviços de Saúde** — VidaPlus

Backend em Node.js + Express + PostgreSQL + Prisma para gerenciamento de hospitais, clínicas, laboratórios e equipes de home care.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo e ajuste as credenciais do banco:
```bash
cp .env.example .env
```

Edite o `.env` com os dados do seu PostgreSQL:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sghss?schema=public"
JWT_SECRET="sua-chave-secreta"
```

### 3. Criar o banco de dados
```sql
CREATE DATABASE sghss;
```

### 4. Rodar as migrations
```bash
npm run prisma:migrate
```

### 5. Popular o banco com dados de teste (opcional)
```bash
npm run prisma:seed
```

### 6. Iniciar o servidor
```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

O servidor estará disponível em: `http://localhost:3000`

---

## 📄 Documentação da API

Acesse a documentação interativa (Swagger) em:
```
http://localhost:3000/api/docs
```

### 🔐 Como testar as rotas no Swagger (Autenticação)

Como grande parte do sistema é protegida, siga estes passos para conseguir testar os endpoints:

1. Vá até a seção **Auth** e abra a rota `POST /auth/login`.
2. Clique em **"Try it out"**.
3. No campo `Request body`, insira o email e senha de um dos usuários de teste (veja as credenciais no final deste README) e clique em **"Execute"**.
4. Se o login for bem sucedido (Status `200`), copie o texto do **`token`** que aparece na resposta (`Server response`). Não copie as aspas.
5. Suba até o topo da página do Swagger, clique no botão verde **"Authorize 🔓"**.
6. Cole o seu token no campo *Value*, clique em **"Authorize"** e depois em **"Close"**.
7. Pronto! 🔒 Os cadeados agora estarão fechados e você pode clicar em **"Try it out"** e **"Execute"** em qualquer outra rota protegida (Paciente, Consulta, etc).
 
 ### 🛡️ Entendendo os Erros de Permissão (RBAC)
 
 O sistema possui **Controle de Acesso Baseado em Cargos (RBAC)**. Existem três perfis de usuários: `PACIENTE`, `PROFISSIONAL` e `ADMIN`.
 Dependendo do Token que você utilizou no Passo 6, algumas rotas vão retornar erros específicos caso você tente fazer algo não permitido:
 
 * **`401 Unauthorized`**: Erro de "Não Autorizado". Significa que o token expirou, está inválido, ou você esqueceu de colocá-lo no botão *Authorize 🔓*.
 * **`403 Forbidden`**: Erro de "Acesso Negado". O token é válido e você está logado, MAS o seu cargo não tem permissão para usar aquela rota. 
   * *Exemplo:* Tentar acessar a rota de "Deletar Paciente" com o token de um `PROFISSIONAL`. Apenas o `ADMIN` pode fazer essa exclusão destrutiva.

### Endpoints Disponíveis

#### 🔐 Autenticação (Auth)
| Método | Rota                | Descrição                          |
|--------|---------------------|------------------------------------|
| POST   | `/api/auth/register` | Registrar novo usuário             |
| POST   | `/api/auth/login`    | Realizar login (retorna JWT token) |
| GET    | `/api/auth/perfil`   | Detalhes do usuário autenticado    |

#### 👤 Pacientes
| Método | Rota                  | Descrição                 |
|--------|-----------------------|---------------------------|
| POST   | `/api/pacientes`      | Cadastrar novo paciente   |
| GET    | `/api/pacientes`      | Listar pacientes          |
| GET    | `/api/pacientes/:id`  | Buscar paciente por ID    |
| PUT    | `/api/pacientes/:id`  | Atualizar paciente        |
| DELETE | `/api/pacientes/:id`  | Remover paciente          |

#### 🩺 Profissionais & Agendas
| Método | Rota                                       | Descrição                           |
|--------|--------------------------------------------|-------------------------------------|
| POST   | `/api/profissionais`                       | Cadastrar Profissional de Saúde     |
| GET    | `/api/profissionais`                       | Listar profissionais                |
| GET    | `/api/profissionais/:id`                   | Buscar profissional por ID          |
| PUT    | `/api/profissionais/:id`                   | Atualizar profissional              |
| DELETE | `/api/profissionais/:id`                   | Remover profissional                |
| POST   | `/api/profissionais/:id/agendas`           | Adicionar horário na agenda         |
| DELETE | `/api/profissionais/:id/agendas/:agendaId` | Remover horário da agenda           |

#### 📅 Consultas
| Método | Rota                         | Descrição                                 |
|--------|------------------------------|-------------------------------------------|
| POST   | `/api/consultas`             | Agendar consulta (Online/Presencial)      |
| GET    | `/api/consultas`             | Listar consultas (filtros disponíveis)    |
| GET    | `/api/consultas/:id`         | Buscar consulta por ID                    |
| PATCH  | `/api/consultas/:id/status`  | Atualizar status (Cancelada/Realizada)    |
| DELETE | `/api/consultas/:id`         | Remover do histórico                      |

#### 📝 Prontuários Médicos
| Método | Rota                                   | Descrição                         |
|--------|----------------------------------------|-----------------------------------|
| POST   | `/api/prontuarios`                     | Criar prontuário após consulta    |
| GET    | `/api/prontuarios/paciente/:pacienteId`| Listar histórico clínico gerado   |
| GET    | `/api/prontuarios/:id`                 | Buscar prontuário por ID          |
| PUT    | `/api/prontuarios/:id`                 | Atualizar descrição/diagnóstico   |

#### 🔬 Exames
| Método | Rota                               | Descrição                                |
|--------|------------------------------------|------------------------------------------|
| POST   | `/api/exames`                      | Solicitar exame via consulta             |
| GET    | `/api/exames/paciente/:pacienteId` | Listar solicitação/resultado de exames   |
| GET    | `/api/exames/:id`                  | Buscar detalhes de um exame              |
| PATCH  | `/api/exames/:id/resultado`        | Inserir laudo/resultado textual do exame |

#### 💊 Prescrições (Receitas Digitais)
| Método | Rota                                 | Descrição                         |
|--------|--------------------------------------|-----------------------------------|
| POST   | `/api/prescricoes`                   | Emitir receita vinculada à consulta|
| GET    | `/api/prescricoes/consulta/:consultaId`| Listar receitas emitidas na consulta|
| GET    | `/api/prescricoes/:id`               | Buscar prescrição por ID          |

#### 🏢 Unidades Hospitalares
| Método | Rota                      | Descrição                         |
|--------|---------------------------|-----------------------------------|
| GET    | `/api/unidades/dashboard` | Dashboard e métricas (ADMIN)      |
| POST   | `/api/unidades`           | Cadastrar nova unidade/hospital   |
| GET    | `/api/unidades`           | Listar unidades hospitalares      |
| GET    | `/api/unidades/:id`       | Detalhes da unidade, com leitos   |
| PUT    | `/api/unidades/:id`       | Atualizar dados da unidade        |
| DELETE | `/api/unidades/:id`       | Remover unidade do sistema        |

#### 🛏️ Leitos
| Método | Rota                     | Descrição                           |
|--------|--------------------------|-------------------------------------|
| POST   | `/api/leitos`            | Cadastrar novo leito de internação  |
| GET    | `/api/leitos`            | Listar capacidade e os leitos livres|
| GET    | `/api/leitos/:id`        | Detalhes (com histórico de ocupação)|
| PATCH  | `/api/leitos/:id/status` | Passar pra manutenção ou desocupar  |
| DELETE | `/api/leitos/:id`        | Remover leito                       |

#### 🏨 Internações
| Método | Rota                      | Descrição                                 |
|--------|---------------------------|-------------------------------------------|
| POST   | `/api/internacoes`        | Admissão do paciente no leito (Ocupa)     |
| GET    | `/api/internacoes`        | Listar fluxo de internações               |
| GET    | `/api/internacoes/:id`    | Dados consolidados da estadia             |
| PATCH  | `/api/internacoes/:id/alta` | Registrar Alta Médica (Libera o leito)    |

#### 📦 Suprimentos (Estoque)
| Método | Rota                            | Descrição                                 |
|--------|---------------------------------|-------------------------------------------|
| POST   | `/api/suprimentos`              | Cadastrar novo item/lote                  |
| GET    | `/api/suprimentos`              | Listar itens e *alertas de estoque baixo* |
| GET    | `/api/suprimentos/:id`          | Detalhes isolados de um item material     |
| PUT    | `/api/suprimentos/:id`          | Corrigir dados estruturais do material    |
| PATCH  | `/api/suprimentos/:id/entrada`  | Dar entrada/soma de itens de lotes novos  |
| PATCH  | `/api/suprimentos/:id/saida`    | Baixa de uso nos setores / Retirada       |
| DELETE | `/api/suprimentos/:id`          | Remover item obsoleto                     |

---

## 🧪 Testes

```bash
npm test
```

### Testando com Postman/Insomnia

#### 1. Registrar usuário
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123",
  "perfil": "PACIENTE"
}
```

#### 2. Fazer login
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "uuid",
    "email": "usuario@email.com",
    "perfil": "PACIENTE"
  }
}
```

#### 3. Cadastrar paciente (autenticado)
```
POST http://localhost:3000/api/pacientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "12345678900",
  "dataNasc": "1990-05-15",
  "telefone": "11999998888",
  "endereco": "Rua A, 123 - São Paulo/SP",
  "sexo": "M"
}
```

---

## 🏗️ Estrutura do Projeto

```
sghss-backend/
├── prisma/                   # Schema e migrations do Prisma
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── src/
│   ├── config/               # Configurações (auth, swagger)
│   ├── middlewares/           # Middlewares (auth, roles, erros, auditoria)
│   ├── modules/              # Módulos de negócio
│   │   ├── auth/
│   │   ├── pacientes/
│   │   ├── profissionais/
│   │   ├── consultas/
│   │   ├── prontuarios/
│   │   ├── exames/
│   │   ├── prescricoes/
│   │   ├── unidades/
│   │   ├── leitos/
│   │   ├── internacoes/
│   │   └── suprimentos/
│   ├── shared/               # Utilitários compartilhados
│   └── app.js
├── tests/                    # Testes automatizados
├── server.js                 # Entry point
└── package.json
```

---

## 📋 Credenciais de Teste (após seed)

| Perfil        | E-mail                     | Senha        |
|---------------|----------------------------|--------------|
| Admin         | admin@vidaplus.com         | admin123     |
| Médico        | dr.carlos@vidaplus.com     | medico123    |
| Paciente      | joao.silva@email.com       | paciente123  |

---

## 🛠️ Tecnologias

- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT** (autenticação)
- **bcryptjs** (hash de senhas)
- **Swagger** (documentação da API)
- **Winston** (logs)
- **Jest + Supertest** (testes)
