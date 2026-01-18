# 🎨 Graphite

Plataforma web para criação visual de gráficos Vega/Vega-Lite compatíveis com Deneb (Power BI). Crie visualizações poderosas sem editar JSON diretamente, usando uma interface intuitiva semelhante ao Figma.

## 🚀 Features

- ✨ **Editor Visual**: Interface intuitiva para criar gráficos sem código
- 📊 **Templates Prontos**: Galeria de templates para começar rapidamente
- 🎨 **Style Panel**: Personalize cores, bordas, eixos, tooltips e mais
- ⚡ **Preview em Tempo Real**: Veja suas mudanças instantaneamente
- 📋 **Export Deneb**: Copie o JSON pronto para usar no Power BI
- 🔐 **Planos Free & Premium**: Controle de acesso e limites

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **Vite** - Build rápido e moderna
- **TypeScript** - Type safety completo
- **Tailwind CSS** + **shadcn/ui** - UI components
- **Zustand** - State management
- **Vega-Lite** + **Vega-Embed** - Renderização de gráficos

### Backend
- **Fastify** - Framework rápido e leve
- **TypeScript** - Type safety
- **Prisma** - ORM type-safe
- **PostgreSQL** - Banco de dados
- **JWT** + **bcrypt** - Autenticação

## 📦 Estrutura do Projeto

```
.
├── frontend/          # React App
│   ├── src/
│   │   ├── app/      # Pages/Routes
│   │   ├── components/ # React components
│   │   ├── lib/      # Vega renderer, API client
│   │   ├── store/    # Zustand stores
│   │   └── types/    # TypeScript types
│   └── package.json
│
├── backend/          # Fastify API
│   ├── src/
│   │   ├── modules/  # Auth, Users, Visuals, Templates
│   │   ├── middleware/ # Auth, Rate limit, Plan limiter
│   │   ├── lib/      # Prisma, JWT, bcrypt
│   │   └── types/    # Shared types
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── package.json      # Root config
```

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd graphite
```

2. Instale as dependências:
```bash
npm run setup
```

3. Configure as variáveis de ambiente:

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vegabuilder"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
PORT=3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

4. Execute as migrations do banco:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. Inicie o desenvolvimento:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🎯 Uso

1. **Registre-se** ou faça login
2. Acesse a **Gallery** e escolha um template
3. Personalize no **Editor** usando o Style Panel
4. Visualize o preview em tempo real
5. Finalize e **copie o JSON** para usar no Deneb (Power BI)

## 📊 Planos

| Feature | FREE | PREMIUM |
|---------|------|---------|
| Criar visuals/dia | 1 | Ilimitado |
| Templates básicos | ✅ | ✅ |
| Templates premium | ❌ | ✅ |
| Export JSON | ✅ | ✅ |

## 🔒 Autenticação

Sistema de autenticação com JWT:
- Access Token: 15 minutos
- Refresh Token: 7 dias
- Senha hashada com bcrypt (10 rounds)

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento (frontend + backend)
npm run dev

# Build (produção)
npm run build

# Frontend apenas
npm run dev:frontend
npm run build:frontend

# Backend apenas
npm run dev:backend
npm run build:backend
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Dados do usuário
- `GET /api/users/me/limits` - Limites do plano
- `PATCH /api/users/me` - Atualizar perfil

### Templates
- `GET /api/templates` - Listar templates
- `GET /api/templates/:id` - Detalhes do template

### Visuals
- `GET /api/visuals` - Listar meus visuals
- `POST /api/visuals` - Criar visual
- `GET /api/visuals/:id` - Detalhes
- `PATCH /api/visuals/:id` - Atualizar
- `DELETE /api/visuals/:id` - Deletar
- `GET /api/visuals/:id/export` - Export JSON Deneb

## 🚀 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy pasta dist/
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Configure DATABASE_URL e secrets
# Start: node dist/server.js
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 License

MIT License - veja o arquivo LICENSE para detalhes.

## 👥 Autores

- Desenvolvido com ❤️ para facilitar a criação de visuais Vega/Deneb

## 🙏 Agradecimentos

- [Vega-Lite](https://vega.github.io/vega-lite/)
- [Deneb](https://deneb-viz.github.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub!**
