# O Entorno — Marketplace de Bairro

Plataforma marketplace local que conecta mercados de bairro aos consumidores do Entorno, permitindo compras online com entrega local via WhatsApp.

## 🚀 Stack Tecnológica

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Lovable Cloud (Supabase)
- **Estado/Cache:** TanStack React Query
- **Autenticação:** Lovable Cloud Auth com RLS

## 👥 Perfis de Usuário

| Perfil | Acesso |
|--------|--------|
| **Cliente** | Navegar mercados, comprar, acompanhar pedidos |
| **Lojista** | Dashboard com CRUD de produtos, gestão de pedidos, configurações da loja |
| **Admin** | Painel administrativo completo: cadastrar mercados, gerenciar usuários e pedidos |

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis (Header, Cards, Skeletons)
├── contexts/       # AuthContext, CartContext
├── hooks/          # useStores, useProducts, useOrders, useUploadImage
├── pages/          # Index, MarketPage, Dashboard, Admin, Login, etc.
├── services/       # Camada de dados (auth, stores, products, orders, admin)
├── integrations/   # Cliente Supabase (auto-gerado)
└── lib/            # Utilitários
```

## 🔐 Segurança

- Autenticação com email/senha via Lovable Cloud Auth
- Row Level Security (RLS) em todas as tabelas
- Roles separadas em tabela `user_roles` (prevenção de escalação de privilégio)
- Edge function com `service_role` para operações admin
- Validação de inputs com Zod

## 🛠️ Como rodar localmente

```sh
git clone <URL_DO_REPOSITÓRIO>
cd o-entorno
npm install
npm run dev
```

## 📦 Deploy

O deploy é feito automaticamente pelo Lovable. Clique em **Publicar** no editor para atualizar o site em produção.

**URL de produção:** https://entorno.lovable.app

## 📋 Fluxos Principais

1. **Cliente:** Cadastro → Login → Navegar mercados → Adicionar ao carrinho → Finalizar via WhatsApp → Acompanhar pedido
2. **Lojista:** Login → Dashboard → Gerenciar produtos (CRUD) → Receber pedidos → Confirmar/Entregar
3. **Admin:** Login → Painel Admin → Cadastrar novos mercados (cria lojista automaticamente) → Ativar/desativar mercados → Gerenciar permissões
