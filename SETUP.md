# 🚀 Guia de Setup Rápido

## Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git

## Setup Local

### 1️⃣ Clone o repositório

```bash
git clone <seu-repo-url>
cd Graphite
```

### 2️⃣ Instale as dependências

```bash
npm run setup
```

Este comando vai instalar todas as dependências do frontend e backend.

### 3️⃣ Configure o PostgreSQL

Crie um banco de dados:

```sql
CREATE DATABASE vegabuilder;
```

### 4️⃣ Configure as variáveis de ambiente

**Backend:**

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/vegabuilder"
JWT_SECRET="sua-chave-secreta-super-segura-aqui"
JWT_REFRESH_SECRET="sua-chave-refresh-super-segura-aqui"
PORT=3000
NODE_ENV=development
```

**Frontend:**

```bash
cd frontend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 5️⃣ Execute as migrations do Prisma

```bash
cd backend
npx prisma migrate dev --name init
```

### 6️⃣ Popule o banco com dados de exemplo (templates)

```bash
npm run db:seed
```

### 7️⃣ Inicie o projeto

**Opção 1: Tudo junto (recomendado para desenvolvimento)**

```bash
# Na raiz do projeto
npm run dev
```

Isso inicia o frontend (porta 5173) e o backend (porta 3000) simultaneamente.

**Opção 2: Separadamente**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 8️⃣ Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📝 Próximos Passos

1. **Crie uma conta** em http://localhost:5173/register
2. **Faça login**
3. **Explore a galeria** de templates
4. **Crie seu primeiro visual** clicando em um template
5. **Customize no editor** usando o Style Panel
6. **Exporte o JSON** para usar no Deneb (Power BI)

## 🛠️ Comandos Úteis

### Projeto Inteiro

```bash
npm run dev          # Inicia frontend + backend
npm run build        # Build de produção (ambos)
npm run setup        # Instala todas as dependências
```

### Frontend

```bash
cd frontend
npm run dev          # Modo desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Lint do código
```

### Backend

```bash
cd backend
npm run dev              # Modo desenvolvimento (watch)
npm run build            # Build de produção
npm run start            # Inicia versão de produção
npm run prisma:migrate   # Rodar migrations
npm run prisma:studio    # Abrir Prisma Studio (GUI do DB)
npm run db:seed          # Popular banco com templates
```

### Prisma

```bash
cd backend
npx prisma studio        # Abrir GUI do banco de dados
npx prisma migrate dev   # Criar nova migration
npx prisma generate      # Gerar Prisma Client
npx prisma db push       # Push schema para DB (desenvolvimento)
```

## 🐛 Troubleshooting

### Erro: "Port 3000 already in use"

Algo já está usando a porta 3000. Mude a porta no `.env` do backend:

```env
PORT=3001
```

E no `.env` do frontend:

```env
VITE_API_URL=http://localhost:3001
```

### Erro: "P1001: Can't reach database server"

Verifique se o PostgreSQL está rodando:

```bash
# Linux/Mac
sudo systemctl status postgresql

# Windows
# Verifique o serviço PostgreSQL no Gerenciador de Tarefas
```

E verifique se a `DATABASE_URL` no `.env` está correta.

### Erro: "Module not found"

Reinstale as dependências:

```bash
npm run setup
```

### Frontend não conecta ao backend

1. Verifique se o backend está rodando
2. Verifique o `VITE_API_URL` no `.env` do frontend
3. Verifique se não há erro de CORS (veja logs do backend)

## 📚 Estrutura do Projeto

```
Graphite/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── app/           # Páginas (Login, Gallery, Editor)
│   │   ├── components/    # Componentes React
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # Vega renderer, API client
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/               # Fastify API
│   ├── src/
│   │   ├── modules/       # Auth, Users, Visuals, Templates
│   │   ├── middleware/    # Auth, Plan limiter
│   │   └── lib/           # Prisma, JWT, bcrypt
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
│
└── package.json           # Root config
```

## 🔐 Planos e Limites

### FREE (Padrão)
- 1 visual por dia
- Acesso a templates básicos

### PREMIUM
- Visuais ilimitados
- Acesso a todos os templates (incluindo premium)

**Para testar o plano PREMIUM**, atualize manualmente no banco:

```sql
UPDATE users SET plan = 'PREMIUM' WHERE email = 'seu@email.com';
```

Ou use o Prisma Studio:

```bash
cd backend
npx prisma studio
```

## 🎨 Templates Disponíveis (Após Seed)

1. **Barra Vertical** (FREE)
2. **Linha Simples** (FREE)
3. **Pizza (Donut)** (FREE)
4. **Scatter Plot** (PREMIUM)
5. **Área Empilhada** (PREMIUM)

## 🤝 Precisa de Ajuda?

- Veja o [README.md](./README.md) para mais informações
- Veja o [CONTRIBUTING.md](./CONTRIBUTING.md) para contribuir
- Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para facilitar a criação de visuais Vega/Deneb**
