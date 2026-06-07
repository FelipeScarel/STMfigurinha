# 🎴 StickerShop — Escopo Técnico Completo

> **Projeto:** E-commerce de Figurinhas Personalizadas e Colecionáveis
> **Data:** 2026-06-07
> **Status:** Planejamento / Pré-Desenvolvimento

---

## Sumário

1. [Arquitetura de Banco de Dados](#1-arquitetura-de-banco-de-dados)
2. [Fluxo do Usuário (User Flow)](#2-fluxo-do-usuário-user-flow)
3. [Fluxo do Administrador](#3-fluxo-do-administrador)
4. [Sugestão de Stack Tecnológica](#4-sugestão-de-stack-tecnológica)
5. [Diagrama de Arquitetura do Sistema](#5-diagrama-de-arquitetura-do-sistema)
6. [Roadmap de Desenvolvimento](#6-roadmap-de-desenvolvimento)

---

## 1. Arquitetura de Banco de Dados

### 1.1 Diagrama Entidade-Relacionamento (DER)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     usuarios      │       │    categorias     │       │     cupons        │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ nome             │       │ nome             │       │ codigo (UNIQUE)  │
│ email (UNIQUE)   │       │ slug (UNIQUE)    │       │ tipo             │
│ senha_hash       │       │ descricao        │       │ valor            │
│ telefone         │       │ imagem_url       │       │ valor_min_pedido │
│ endereco_rua     │       │ ativo            │       │ data_inicio      │
│ endereco_numero  │       │ ordem            │       │ data_expiracao   │
│ endereco_comp    │       │ criado_em        │       │ uso_maximo       │
│ endereco_bairro  │       └──────────────────┘       │ uso_atual        │
│ endereco_cidade  │                                  │ ativo            │
│ endereco_estado  │       ┌──────────────────┐       │ criado_em        │
│ endereco_cep     │       │    produtos       │       └──────────────────┘
│ role             │       ├──────────────────┤
│ criado_em        │       │ id (PK)          │       ┌──────────────────────────┐
│ atualizado_em    │       │ nome             │       │  regras_promocao          │
└──────────────────┘       │ descricao        │       ├──────────────────────────┤
        │                  │ preco_base       │       │ id (PK)                  │
        │ 1                │ categoria_id(FK) │       │ nome                     │
        │                  │ imagem_url       │       │ tipo (ENUM)              │
        │                  │ tipo (ENUM)      │       │   - compre_x_pague_y     │
        │                  │   - pronta       │       │   - desconto_por_qtde    │
        │                  │   - personalizada│       │   - desconto_percentual  │
        │                  │ ativo            │       │ condicao_qtde_comprar    │
        │                  │ destaque         │       │ condicao_qtde_pagar      │
        │                  │ criado_em        │       │ desconto_percentual      │
        │                  │ atualizado_em    │       │ aplica_a (ENUM)          │
        │                  └──────────────────┘       │   - todos                │
        │                        │                   │   - categoria             │
        │                        │ 1                 │   - produto               │
        │                        │                   │ categoria_id (FK, NULL)   │
        │                        │                   │ produto_id (FK, NULL)     │
        │                        │                   │ data_inicio              │
        │     ┌──────────────────┴──────────┐        │ data_expiracao           │
        │     │     produtos_variantes       │        │ ativo                    │
        │     ├─────────────────────────────┤        │ criado_em                │
        │     │ id (PK)                     │        │ atualizado_em            │
        │     │ produto_id (FK)             │        └──────────────────────────┘
        │     │ tamanho (ENUM)              │
        │     │   - 5x5cm                   │        ┌──────────────────────────┐
        │     │   - 7x7cm                   │        │     pedidos               │
        │     │   - 10x10cm                 │        ├──────────────────────────┤
        │     │ acabamento (ENUM)           │        │ id (PK)                  │
        │     │   - brilhante               │        │ usuario_id (FK)          │
        │     │   - fosco                   │        │ status (ENUM)            │
        │     │   - holografico             │        │   - aguardando_pagamento │
        │     │ preco_adicional             │        │   - pago                  │
        │     │ estoque                     │        │   - em_producao           │
        │     └─────────────────────────────┘        │   - enviado               │
        │                                            │   - entregue              │
        │                                            │   - cancelado             │
        │                                            │ subtotal                  │
        │     ┌──────────────────────────┐           │ desconto_total            │
        │     │ uploads_personalizados    │           │ frete                     │
        │     ├──────────────────────────┤           │ total                     │
        │     │ id (PK)                  │           │ cupom_id (FK, NULL)       │
        │     │ usuario_id (FK)          │           │ regra_promocao_id(FK,NULL)│
        │     │ imagem_original_url      │           │ endereco_rua              │
        │     │ imagem_preview_url       │           │ endereco_numero           │
        │     │ imagem_alta_res_url      │           │ endereco_comp             │
        │     │ tamanho                  │           │ endereco_bairro           │
        │     │ acabamento               │           │ endereco_cidade           │
        │     │ quantidade               │           │ endereco_estado           │
        │     │ status (ENUM)            │           │ endereco_cep              │
        │     │   - pendente             │           │ observacao                │
        │     │   - aprovado             │           │ criado_em                 │
        │     │   - em_producao          │           │ atualizado_em             │
        │     │   - concluido            │           └──────────────────────────┘
        │     │ criado_em                │                     │
        │     └──────────────────────────┘                     │ 1
        │                                                      │
        │                                            ┌─────────┴─────────────┐
        │                                            │     itens_pedido       │
        │                                            ├───────────────────────┤
        │                                            │ id (PK)               │
        │                                            │ pedido_id (FK)        │
        │                                            │ produto_id (FK, NULL) │
        │                                            │ variante_id (FK, NULL)│
        │                                            │ upload_id (FK, NULL)  │
        │                                            │ tipo_item (ENUM)      │
        │                                            │   - produto_pronto    │
        │                                            │   - personalizado     │
        │                                            │ quantidade            │
        │                                            │ preco_unitario        │
        │                                            │ subtotal              │
        │                                            └───────────────────────┘
        │
        │
        │     ┌──────────────────────────────────┐
        │     │      timeline_pedido              │
        │     ├──────────────────────────────────┤
        │     │ id (PK)                          │
        │     │ pedido_id (FK)                   │
        │     │ status_anterior                  │
        │     │ status_novo                      │
        │     │ mensagem                         │
        │     │ criado_por (ENUM)                │
        │     │   - sistema                      │
        │     │   - admin                        │
        │     │ criado_em                        │
        │     └──────────────────────────────────┘
```

### 1.2 Dicionário de Dados Detalhado

#### **Tabela: `usuarios`** (Clientes e Admins)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` | Identificador único |
| `nome` | `VARCHAR(255)` | NOT NULL | Nome completo |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Email de login |
| `senha_hash` | `VARCHAR(255)` | NOT NULL | Hash bcrypt da senha |
| `telefone` | `VARCHAR(20)` | NULL | WhatsApp/contato |
| `endereco_rua` | `VARCHAR(255)` | NULL | — |
| `endereco_numero` | `VARCHAR(20)` | NULL | — |
| `endereco_comp` | `VARCHAR(100)` | NULL | Complemento |
| `endereco_bairro` | `VARCHAR(100)` | NULL | — |
| `endereco_cidade` | `VARCHAR(100)` | NULL | — |
| `endereco_estado` | `CHAR(2)` | NULL | UF (SP, RJ, etc.) |
| `endereco_cep` | `VARCHAR(9)` | NULL | Formato: 00000-000 |
| `role` | `ENUM('cliente','admin')` | DEFAULT `'cliente'` | Nível de acesso |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |
| `atualizado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Atualizado via trigger |

#### **Tabela: `categorias`**

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `nome` | `VARCHAR(100)` | NOT NULL | Ex: "Anime", "Futebol", "Memes" |
| `slug` | `VARCHAR(120)` | UNIQUE, NOT NULL | Versão URL-amigável |
| `descricao` | `TEXT` | NULL | — |
| `imagem_url` | `VARCHAR(500)` | NULL | Capa da categoria |
| `ativo` | `BOOLEAN` | DEFAULT `TRUE` | Soft delete |
| `ordem` | `INTEGER` | DEFAULT `0` | Ordenação na vitrine |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

#### **Tabela: `produtos`** (Figurinhas prontas ou base personalizável)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `nome` | `VARCHAR(255)` | NOT NULL | Nome da figurinha |
| `descricao` | `TEXT` | NULL | Descrição detalhada |
| `preco_base` | `DECIMAL(10,2)` | NOT NULL, CHECK ≥ 0 | Preço sem variante |
| `categoria_id` | `UUID` | FK → `categorias.id` | Categoria do produto |
| `imagem_url` | `VARCHAR(500)` | NULL | Imagem principal (WebP) |
| `tipo` | `ENUM('pronta','personalizada')` | NOT NULL | Tipo do produto |
| `ativo` | `BOOLEAN` | DEFAULT `TRUE` | — |
| `destaque` | `BOOLEAN` | DEFAULT `FALSE` | Aparece na home |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |
| `atualizado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

**Índices:** `idx_produtos_categoria`, `idx_produtos_tipo`, `idx_produtos_destaque`

#### **Tabela: `produtos_variantes`** (Tamanhos e acabamentos)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `produto_id` | `UUID` | FK → `produtos.id` ON DELETE CASCADE | — |
| `tamanho` | `ENUM('5x5','7x7','10x10')` | NOT NULL | Dimensões em cm |
| `acabamento` | `ENUM('brilhante','fosco','holografico')` | NOT NULL | Tipo de laminação |
| `preco_adicional` | `DECIMAL(10,2)` | DEFAULT `0.00` | Acresce ao preco_base |
| `estoque` | `INTEGER` | DEFAULT `0` | — |

**Índices:** `UNIQUE(produto_id, tamanho, acabamento)`

#### **Tabela: `uploads_personalizados`** (Uploads do cliente)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `usuario_id` | `UUID` | FK → `usuarios.id` | Quem fez o upload |
| `imagem_original_url` | `VARCHAR(500)` | NOT NULL | Arquivo original (PNG/JPEG) |
| `imagem_preview_url` | `VARCHAR(500)` | NOT NULL | Versão WebP 300x300 |
| `imagem_alta_res_url` | `VARCHAR(500)` | NOT NULL | PNG 300 DPI para produção |
| `tamanho` | `ENUM('5x5','7x7','10x10')` | NOT NULL | — |
| `acabamento` | `ENUM('brilhante','fosco','holografico')` | NOT NULL | — |
| `quantidade` | `INTEGER` | NOT NULL, DEFAULT `1` | — |
| `status` | `ENUM('pendente','aprovado','em_producao','concluido')` | DEFAULT `'pendente'` | — |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

#### **Tabela: `pedidos`**

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `usuario_id` | `UUID` | FK → `usuarios.id` | Comprador |
| `status` | `ENUM(...)` | NOT NULL, DEFAULT `'aguardando_pagamento'` | Ciclo de vida |
| `subtotal` | `DECIMAL(10,2)` | NOT NULL | Soma dos itens |
| `desconto_total` | `DECIMAL(10,2)` | DEFAULT `0.00` | Cupom + promoção |
| `frete` | `DECIMAL(10,2)` | DEFAULT `0.00` | Calculado via API |
| `total` | `DECIMAL(10,2)` | NOT NULL | `subtotal - desconto + frete` |
| `cupom_id` | `UUID` | FK → `cupons.id`, NULL | Cupom aplicado |
| `regra_promocao_id` | `UUID` | FK → `regras_promocao.id`, NULL | Promoção automática |
| `endereco_*` | — | (snapshot do endereço no momento da compra) | — |
| `observacao` | `TEXT` | NULL | — |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |
| `atualizado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

**Status ENUM:**
- `aguardando_pagamento` — Pedido criado, pagamento pendente
- `pago` — Pagamento confirmado
- `em_producao` — Em fabricação
- `enviado` — Despachado para transporte
- `entregue` — Confirmado pelo cliente
- `cancelado` — Cancelado (estorno se aplicável)

#### **Tabela: `itens_pedido`**

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` ON DELETE CASCADE | — |
| `produto_id` | `UUID` | FK → `produtos.id`, NULL | Nulo se for personalizado |
| `variante_id` | `UUID` | FK → `produtos_variantes.id`, NULL | — |
| `upload_id` | `UUID` | FK → `uploads_personalizados.id`, NULL | Nulo se for produto pronto |
| `tipo_item` | `ENUM('produto_pronto','personalizado')` | NOT NULL | — |
| `quantidade` | `INTEGER` | NOT NULL, CHECK > 0 | — |
| `preco_unitario` | `DECIMAL(10,2)` | NOT NULL | Preço congelado no momento |
| `subtotal` | `DECIMAL(10,2)` | NOT NULL | `quantidade × preco_unitario` |

#### **Tabela: `timeline_pedido`** (Histórico de status)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `pedido_id` | `UUID` | FK → `pedidos.id` ON DELETE CASCADE | — |
| `status_anterior` | `VARCHAR(30)` | NULL | NULL na primeira entrada |
| `status_novo` | `VARCHAR(30)` | NOT NULL | — |
| `mensagem` | `TEXT` | NULL | Ex: "Pagamento confirmado via Pix" |
| `criado_por` | `ENUM('sistema','admin')` | NOT NULL | — |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

#### **Tabela: `cupons`**

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `codigo` | `VARCHAR(50)` | UNIQUE, NOT NULL | Ex: `STICKER20` |
| `tipo` | `ENUM('percentual','valor_fixo')` | NOT NULL | — |
| `valor` | `DECIMAL(10,2)` | NOT NULL, CHECK > 0 | 20.00 = 20% ou R$20,00 |
| `valor_min_pedido` | `DECIMAL(10,2)` | DEFAULT `0.00` | Pedido mínimo |
| `data_inicio` | `TIMESTAMPTZ` | NOT NULL | — |
| `data_expiracao` | `TIMESTAMPTZ` | NOT NULL | — |
| `uso_maximo` | `INTEGER` | NULL | NULL = ilimitado |
| `uso_atual` | `INTEGER` | DEFAULT `0` | Incrementado a cada uso |
| `ativo` | `BOOLEAN` | DEFAULT `TRUE` | — |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

#### **Tabela: `regras_promocao`** (Promoções automáticas)

| Coluna | Tipo | Restrições | Descrição |
|---|---|---|---|
| `id` | `UUID` | PK | — |
| `nome` | `VARCHAR(255)` | NOT NULL | Ex: "Leve 5, Pague 4" |
| `tipo` | `ENUM(...)` | NOT NULL | Ver abaixo |
| `condicao_qtde_comprar` | `INTEGER` | NULL | Ex: 5 (compre 5) |
| `condicao_qtde_pagar` | `INTEGER` | NULL | Ex: 4 (pague 4) |
| `desconto_percentual` | `DECIMAL(5,2)` | NULL | Ex: 10.00 = 10% off |
| `aplica_a` | `ENUM('todos','categoria','produto')` | NOT NULL | Escopo da regra |
| `categoria_id` | `UUID` | FK → `categorias.id`, NULL | — |
| `produto_id` | `UUID` | FK → `produtos.id`, NULL | — |
| `data_inicio` | `TIMESTAMPTZ` | NOT NULL | — |
| `data_expiracao` | `TIMESTAMPTZ` | NOT NULL | — |
| `ativo` | `BOOLEAN` | DEFAULT `TRUE` | — |
| `criado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |
| `atualizado_em` | `TIMESTAMPTZ` | DEFAULT `NOW()` | — |

**Tipos de regra (`tipo` ENUM):**
- `compre_x_pague_y` — "Leve 5, Pague 4" (usa `condicao_qtde_comprar` + `condicao_qtde_pagar`)
- `desconto_por_qtde` — "A partir de 10 unidades, 15% off" (usa `condicao_qtde_comprar` + `desconto_percentual`)
- `desconto_percentual` — Desconto direto por categoria/produto (usa `desconto_percentual`)

---

## 2. Fluxo do Usuário (User Flow)

### 2.1 Jornada Principal — Compra de Figurinha Personalizada

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  FLUXO COMPLETO DO CLIENTE                               │
└─────────────────────────────────────────────────────────────────────────┘

[1] ENTRADA NO SITE
    │  Landing page com:
    │  • Banner principal (destaques/promoções)
    │  • Categorias populares
    │  • Grid de figurinhas em destaque
    │  • Call-to-action: "Crie sua Figurinha Personalizada"
    │
    ▼
[2] NAVEGAÇÃO / DESCOBERTA
    │  O usuário pode:
    │  • Navegar por categorias (Anime, Futebol, Memes...)
    │  • Usar busca com filtros (preço, tamanho, tipo)
    │  • Clicar em uma figurinha para ver detalhes
    │
    ├─── [2a] FLUXO: FIGURINHA PRONTA ──────────────────────┐
    │    │  Página de detalhes do produto:                   │
    │    │  • Galeria de imagens (zoom ao hover)             │
    │    │  • Seletor de tamanho (5x5 / 7x7 / 10x10 cm)     │
    │    │  • Seletor de acabamento (Brilhante/Fosco/Holo)  │
    │    │  • Preço dinâmico (base + variante)               │
    │    │  • Quantidade                                     │
    │    │  • Botão "Adicionar ao Carrinho"                  │
    │    │                                                   │
    │    └───► [3] CARRINHO                                  │
    │                                                         │
    └─── [2b] FLUXO: FIGURINHA PERSONALIZADA ───────────────┐
         │  Página de personalização:                        │
         │                                                   │
         │  PASSO 1 — Upload da Imagem                       │
         │  • Área de drag-and-drop ou clique para upload    │
         │  • Formatos aceitos: PNG, JPEG, WebP (máx 10MB)  │
         │  • Validação de dimensão mínima (ex: 500x500px)   │
         │  • Feedback visual do upload (progress bar)       │
         │                                                   │
         │  PASSO 2 — Recorte e Ajuste                       │
         │  • Ferramenta de crop interativa (react-easy-crop)│
         │  • Pré-visualização em tempo real                 │
         │  • Molduras/templates opcionais                   │
         │                                                   │
         │  PASSO 3 — Configuração                           │
         │  • Seletor de tamanho                             │
         │  • Seletor de acabamento                          │
         │  • Quantidade                                     │
         │                                                   │
         │  PASSO 4 — Preview Final                          │
         │  • Mockup realista da figurinha                   │
         │  • Efeito de brilho/fosco/holográfico simulado    │
         │  • Preço total calculado                          │
         │  • Botão "Adicionar ao Carrinho"                  │
         │                                                   │
         └───► [3] CARRINHO                                  │
                                                              │
[3] CARRINHO ────────────────────────────────────────────────┘
    │  • Lista de itens (prontos + personalizados)
    │  • Cada item mostra: thumbnail, nome, tamanho, acabamento, qtd, preço
    │  • Controles de quantidade (+/-) e remover
    │  • Aplica automaticamente regras de promoção
    │    Ex: "🎉 Leve 5, Pague 4! Você economizou R$4,90"
    │  • Campo para código de cupom
    │  • Resumo: Subtotal → Descontos → Frete → Total
    │
    ▼
[4] CHECKOUT
    │  Se não logado → Redireciona para Login/Cadastro
    │
    │  ETAPA 1 — Endereço de Entrega
    │  • Usa endereço cadastrado OU permite novo
    │  • Cálculo de frete em tempo real (API Correios/Melhorenvio)
    │
    │  ETAPA 2 — Revisão do Pedido
    │  • Resumo completo dos itens
    │  • Endereço confirmado
    │  • Cupons e descontos aplicados
    │  • Prazo estimado de entrega
    │
    │  ETAPA 3 — Pagamento
    │  • Opções: Pix, Cartão de Crédito, Boleto
    │  • Integração com gateway (Stripe/MercadoPago/PagSeguro)
    │  • Feedback em tempo real:
    │    - Pix: QR Code + código copia-e-cola
    │    - Cartão: formulário tokenizado
    │
    ▼
[5] CONFIRMAÇÃO
    │  • Tela de "Pedido Realizado com Sucesso!"
    │  • Número do pedido
    │  • Resumo + status
    │  • Instruções de pagamento (se aplicável)
    │  • Link para acompanhar pedido
    │  • Email automático de confirmação
    │
    ▼
[6] PÓS-COMPRA
    │  • Área "Meus Pedidos" no perfil
    │  • Timeline do pedido (status atualizado em tempo real)
    │  • Notificações por email a cada mudança de status:
    │    - "Pagamento confirmado"
    │    - "Seu pedido entrou em produção 🏭"
    │    - "Seu pedido foi enviado 📦" (com código de rastreio)
    │    - "Seu pedido foi entregue ✅"
    │  • Botão "Comprar Novamente"
```

### 2.2 Estados e Edge Cases da Interface

| Estado | Comportamento |
|---|---|
| **Carrinho vazio** | Ilustração + mensagem "Seu carrinho está vazio" + CTA para vitrine |
| **Upload inválido** | Toast/modal explicando o erro (formato, tamanho, dimensão) |
| **Upload excedeu limite** | Mensagem clara: "O arquivo deve ter no máximo 10MB" |
| **Cupom inválido** | Feedback inline: "Cupom expirado" / "Cupom não encontrado" |
| **Cupom já usado** | "Você já utilizou este cupom" |
| **Promoção automática** | Banner/destaque no carrinho indicando a economia |
| **Sem estoque** | Variante desabilitada no seletor com label "Indisponível" |
| **Falha no pagamento** | Tela de erro com opção de tentar novamente |
| **Sessão expirada** | Modal de re-login preservando o carrinho |
| **Loading states** | Skeleton screens em grids, spinners em botões de ação |
| **Erro de rede** | Toast com opção "Tentar novamente" |

---

## 3. Fluxo do Administrador

### 3.1 Painel de Controle — Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 FLUXO DO ADMINISTRADOR                                   │
└─────────────────────────────────────────────────────────────────────────┘

[1] LOGIN
    │  • Rota exclusiva: /admin/login
    │  • Email + Senha (apenas role='admin')
    │  • 2FA opcional (TOTP) — recomendado
    │  • Sessão com JWT (acesso) + Refresh Token
    │
    ▼
[2] DASHBOARD PRINCIPAL
    │  Cards de métricas rápidas:
    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  │ Pedidos  │ │ Pedidos  │ │ Pedidos  │ │Faturamento│
    │  │  Novos   │ │   em     │ │ Entregues│ │  do Mês   │
    │  │   12     │ │ Produção │ │   45     │ │ R$3.240   │
    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘
    │
    │  • Gráfico de vendas (últimos 30 dias)
    │  • Últimos pedidos (tabela resumida)
    │  • Alertas: uploads pendentes de revisão
    │
    ▼
[3] GERENCIAMENTO DE PEDIDOS
    │
    │  [3a] LISTA DE PEDIDOS
    │  ┌─────────────────────────────────────────────────────┐
    │  │ Filtros: Status | Data | Cliente | Tipo            │
    │  │                                                     │
    │  │ #1234  João Silva     R$89,70  em_producao  12/06  │
    │  │ #1235  Maria Souza    R$45,00  aguardando   12/06  │
    │  │ #1236  Pedro Alves    R$32,90  pago         12/06  │
    │  │ ...                                                 │
    │  └─────────────────────────────────────────────────────┘
    │
    │  [3b] DETALHE DO PEDIDO (ao clicar)
    │  ┌─────────────────────────────────────────────────────┐
    │  │ ◄ Voltar                    Pedido #1234            │
    │  │                                                     │
    │  │ CLIENTE: João Silva | joao@email.com | (11) 9....  │
    │  │ STATUS ATUAL: [Aguardando Pagamento]                │
    │  │                                                     │
    │  │ ITENS DO PEDIDO:                                    │
    │  │ ┌──────────────────────────────────────────────┐    │
    │  │ │ [IMG]  Figurinha Personalizada #1            │    │
    │  │ │        Tamanho: 7x7cm | Acabamento: Holo     │    │
    │  │ │        Qtd: 3 | Preço un.: R$9,90            │    │
    │  │ │        Subtotal: R$29,70                     │    │
    │  │ │        ⬇ Baixar Imagem Original (Alta Res)   │    │
    │  │ │        ⬇ Baixar Todas as Imagens (.zip)      │    │
    │  │ └──────────────────────────────────────────────┘    │
    │  │ ┌──────────────────────────────────────────────┐    │
    │  │ │ [IMG]  Figurinha Pronta - Naruto             │    │
    │  │ │        Tamanho: 5x5cm | Acabamento: Brilho   │    │
    │  │ │        Qtd: 2 | Preço un.: R$5,90            │    │
    │  │ │        Subtotal: R$11,80                     │    │
    │  │ └──────────────────────────────────────────────┘    │
    │  │                                                     │
    │  │ RESUMO: Subtotal R$41,50 | Desconto -R$4,50       │
    │  │         Frete R$12,00 | TOTAL R$49,00              │
    │  │                                                     │
    │  │ ENDEREÇO DE ENTREGA: Rua X, 123 - São Paulo/SP    │
    │  │                                                     │
    │  │ ATUALIZAR STATUS:                                   │
    │  │ [Aguardando] → [Pago] → [Em Produção] → [Enviado]  │
    │  │                              ↓                      │
    │  │                 [Atualizar Status]                  │
    │  │                                                     │
    │  │ TIMELINE:                                           │
    │  │ 12/06 14:30 — Pedido criado (sistema)              │
    │  │ 12/06 14:31 — Aguardando pagamento (sistema)       │
    │  └─────────────────────────────────────────────────────┘
    │
    ▼
[4] FLUXO DE TRATAMENTO DE UPLOAD PERSONALIZADO
    │
    │  Quando um pedido com item tipo='personalizado' chega:
    │
    │  1. Admin vê o pedido na lista com badge "PERSONALIZADO"
    │  2. Clica no pedido → vê os itens personalizados
    │  3. Cada item personalizado tem:
    │     • Thumbnail da pré-visualização
    │     • Botão "Baixar Imagem Original" (PNG/JPEG alta resolução)
    │     • Botão "Baixar Todas as Imagens" (ZIP com todos os uploads do pedido)
    │  4. Admin faz o download, envia para produção
    │  5. Atualiza status: Pago → Em Produção → Enviado
    │  6. Cliente recebe notificação por email automaticamente
    │
    ▼
[5] SISTEMA DE OFERTAS E CUPONS
    │
    │  [5a] LISTA DE REGRAS DE PROMOÇÃO
    │  ┌─────────────────────────────────────────────────────┐
    │  │ + Nova Regra                                        │
    │  │                                                     │
    │  │ Regra 1: Leve 5, Pague 4     (todos)     ATIVA     │
    │  │ Regra 2: 10% off Categoria   (Anime)     ATIVA     │
    │  │ Regra 3: 15% off acima de 10 (Futebol)   INATIVA   │
    │  └─────────────────────────────────────────────────────┘
    │
    │  [5b] CRIAR/EDITAR REGRA (modal ou página dedicada)
    │  ┌─────────────────────────────────────────────────────┐
    │  │ Nova Regra de Promoção                              │
    │  │                                                     │
    │  │ Nome: [Leve 5, Pague 4                    ]        │
    │  │                                                     │
    │  │ Tipo: (•) Compre X, Pague Y                         │
    │  │       ( ) Desconto por Quantidade                   │
    │  │       ( ) Desconto Percentual                       │
    │  │                                                     │
    │  │ Quantidade a Comprar: [5  ]                         │
    │  │ Quantidade a Pagar:   [4  ]                         │
    │  │                                                     │
    │  │ Aplicar a: (•) Todos os produtos                    │
    │  │           ( ) Categoria: [Selecionar...]            │
    │  │           ( ) Produto específico: [Selecionar...]   │
    │  │                                                     │
    │  │ Validade: De [12/06/2026] até [31/12/2026]          │
    │  │                                                     │
    │  │ [✓] Ativo                                           │
    │  │                                                     │
    │  │ [Cancelar]  [Salvar Regra]                          │
    │  └─────────────────────────────────────────────────────┘
    │
    │  [5c] LISTA DE CUPONS
    │  ┌─────────────────────────────────────────────────────┐
    │  │ + Novo Cupom                                        │
    │  │                                                     │
    │  │ Código          Tipo      Valor   Uso       Status  │
    │  │ STICKER20       Percent   20%     5/100     ATIVO   │
    │  │ FRETEGRATIS     Fixo      R$15    12/50     ATIVO   │
    │  │ BLACK50         Percent   50%     200/200   ESGOTADO│
    │  └─────────────────────────────────────────────────────┘
    │
    │  [5d] CRIAR/EDITAR CUPOM
    │  ┌─────────────────────────────────────────────────────┐
    │  │ Novo Cupom                                          │
    │  │                                                     │
    │  │ Código: [STICKER20                        ]         │
    │  │                                                     │
    │  │ Tipo:  (•) Percentual (%)                           │
    │  │        ( ) Valor Fixo (R$)                          │
    │  │                                                     │
    │  │ Valor: [20    ] %                                   │
    │  │                                                     │
    │  │ Pedido mínimo: [R$ 50,00            ]               │
    │  │                                                     │
    │  │ Limite de usos: [100       ] (deixe vazio = ∞)      │
    │  │                                                     │
    │  │ Validade: De [12/06/2026] até [31/12/2026]          │
    │  │                                                     │
    │  │ [✓] Ativo                                           │
    │  │                                                     │
    │  │ [Cancelar]  [Salvar Cupom]                          │
    │  └─────────────────────────────────────────────────────┘
```

### 3.2 Lógica de Aplicação das Regras de Promoção (Engine)

```
PSEUDOCÓDIGO — Executado no backend ao montar o carrinho/checkout:

function calcularDescontos(carrinho):
    desconto_total = 0
    regras_aplicadas = []

    // 1. Buscar regras ativas dentro da validade
    regras_ativas = db.regras_promocao.find({
        ativo: true,
        data_inicio <= NOW,
        data_expiracao >= NOW
    })

    // 2. Para cada regra, verificar se aplica
    for regra in regras_ativas:

        // Filtra itens do carrinho pelo escopo da regra
        if regra.aplica_a == 'categoria':
            itens = carrinho.itens.filter(i => i.categoria_id == regra.categoria_id)
        else if regra.aplica_a == 'produto':
            itens = carrinho.itens.filter(i => i.produto_id == regra.produto_id)
        else:
            itens = carrinho.itens  // todos

        qtd_total = sum(itens.map(i => i.quantidade))

        switch regra.tipo:

            case 'compre_x_pague_y':
                // Ex: Leve 5, Pague 4 → o item mais barato de cada grupo de 5 é grátis
                if qtd_total >= regra.condicao_qtde_comprar:
                    grupos = floor(qtd_total / regra.condicao_qtde_comprar)
                    itens_ordenados = orderByPreco(itens, 'asc')
                    for g in 1..grupos:
                        mais_barato = pegarProximoMaisBarato(itens_ordenados)
                        desconto_total += mais_barato.preco_unitario
                    regras_aplicadas.push(regra)

            case 'desconto_por_qtde':
                if qtd_total >= regra.condicao_qtde_comprar:
                    for item in itens:
                        desconto_total += item.subtotal * (regra.desconto_percentual / 100)
                    regras_aplicadas.push(regra)

            case 'desconto_percentual':
                for item in itens:
                    desconto_total += item.subtotal * (regra.desconto_percentual / 100)
                regras_aplicadas.push(regra)

    return { desconto_total, regras_aplicadas }
```

---

## 4. Sugestão de Stack Tecnológica

### 4.1 Visão Geral da Stack Recomendada

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ARQUITETURA EM 3 CAMADAS                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    FRONTEND (Next.js 14+)                      │      │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐   │      │
│  │  │Vitrine   │ │Personaliz│ │ Carrinho  │ │   Admin      │   │      │
│  │  │(SSR/ISR) │ │ (CSR)    │ │ (CSR)     │ │   (CSR)      │   │      │
│  │  └──────────┘ └──────────┘ └───────────┘ └──────────────┘   │      │
│  │  React 18 + TypeScript + Tailwind CSS + Shadcn/ui           │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                              │ HTTP/2 + JSON                            │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    BACKEND (Next.js API Routes + tRPC)         │      │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐   │      │
│  │  │Catálogo  │ │ Checkout │ │  Upload   │ │   Promo      │   │      │
│  │  │Service   │ │ Service  │ │  Service  │ │   Engine     │   │      │
│  │  └──────────┘ └──────────┘ └───────────┘ └──────────────┘   │      │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐                     │      │
│  │  │  Auth    │ │  Email   │ │  Imagem   │                     │      │
│  │  │ Service  │ │ Service  │ │Processor  │                     │      │
│  │  └──────────┘ └──────────┘ └───────────┘                     │      │
│  │  Prisma ORM + Zod (validação) + NextAuth.js                  │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                    │               │               │                    │
│         ┌──────────▼───┐  ┌────────▼───────┐  ┌───▼──────────────┐    │
│         │  PostgreSQL   │  │  AWS S3 /      │  │  Redis (Cache)   │    │
│         │  (Neon/Supab) │  │  Cloudflare R2 │  │  + BullMQ (Jobs) │    │
│         │  Dados        │  │  Imagens       │  │  Filas           │    │
│         └──────────────┘  └────────────────┘  └──────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Stack Detalhada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend Framework** | **Next.js 14+** (App Router) | SSR/ISR para SEO na vitrine; CSR para admin e personalização. Híbrido que resolve build, deploy e API no mesmo repo |
| **Linguagem** | **TypeScript** (strict) | Segurança de tipos ponta a ponta (compartilha tipos com Prisma/tRPC) |
| **Estilização** | **Tailwind CSS** + **Shadcn/ui** | Design system consistente, componentes acessíveis (Radix), customizáveis. Fácil de manter consistência visual |
| **Componentes** | **Shadcn/ui** (Radix primitives) | Modal, Dropdown, Tabs, Sheet, Command (busca), Toast, Select — todos acessíveis e headless |
| **Gerenciamento de Estado** | **Zustand** (carrinho) + **React Query / TanStack Query** (dados do servidor) | Zustand é minimalista e suficiente para estado local (carrinho). TanStack Query para cache, revalidação e optimistic updates |
| **ORM** | **Prisma** | Schema-first, migrations automáticas, ótima DX com TypeScript, relações fáceis de definir |
| **Banco de Dados** | **PostgreSQL 16** (Neon ou Supabase) | JSONB para metadados flexíveis, ACID, índices avançados, escala horizontal com read replicas. Supabase oferece também Auth e Storage |
| **Auth** | **NextAuth.js v5 (Auth.js)** | Suporte a credenciais + OAuth (Google), JWT, proteção de rotas por middleware, multi-sessão |
| **Upload de Imagens** | **React-Dropzone** + **react-easy-crop** (frontend) → **AWS S3 / Cloudflare R2** (storage) | Dropzone para drag-and-drop, Easy-Crop para recorte interativo, S3/R2 para escalabilidade de storage |
| **Processamento de Imagens** | **Sharp** (backend Node.js) | Redimensionamento, conversão WebP, geração de thumbnails, extração de metadados. Processado em fila (BullMQ) |
| **Filas / Jobs** | **BullMQ** + **Redis** | Processamento assíncrono de imagens, envio de emails, notificações |
| **Pagamentos** | **Stripe** (ou **MercadoPago** se foco BR) | Checkout tokenizado, PCI-compliant, webhooks para confirmação automática, suporte a Pix (MercadoPago) |
| **Frete** | **Melhor Envio API** (BR) | Cálculo de frete em tempo real, múltiplas transportadoras, geração de etiquetas |
| **Emails Transacionais** | **Resend** (React Email) | Templates em JSX, disparo via fila, tracking de abertura |
| **Hospedagem** | **Vercel** (frontend + API) — ou **Railway** / **Fly.io** | Deploy automático via Git, previews por branch, serverless otimizado p/ Next.js. Railway/Fly se precisar de mais controle |
| **Storage de Imagens** | **Cloudflare R2** (recomendado) ou **AWS S3** | R2: sem taxa de egress, compatível com S3 API, CDN global. Ideal para servir imagens otimizadas |
| **CDN / Otimização** | **Cloudflare Images** ou **next/image** | Transformação on-the-fly (WebP/AVIF), lazy loading, blur placeholder |
| **Monitoramento** | **Sentry** + **PostHog** (analytics) | Erros + session replay + funis de conversão |
| **CI/CD** | **GitHub Actions** | Lint, type-check, tests, deploy preview |

### 4.3 Alternativas para Considerar

| Cenário | Stack Alternativa |
|---|---|
| **Foco total no Brasil** (Pix, boleto, frete PAC/SEDEX) | Next.js + Supabase + MercadoPago + Melhor Envio. Supabase já inclui Auth e Storage com S3 compatível |
| **Equipe pequena, MVP rápido** | Next.js + Supabase (Auth, DB, Storage tudo integrado) + Stripe. 80% da stack num só provedor |
| **Escala enterprise prevista** | Next.js + NestJS (backend separado) + PostgreSQL + AWS S3/SQS/Lambda. Microsserviços quando necessário |
| **Mobile-first / App nativo futuramente** | Separar backend como API REST/GraphQL desde o início (NestJS ou Fastify). Frontend Next.js consome a API. App React Native reutiliza a mesma API |

---

## 5. Diagrama de Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DIAGRAMA DE ARQUITETURA                           │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │   USUÁRIO     │
                              │  (Browser)    │
                              └───────┬───────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         VERCEL / EDGE                                    │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    Next.js 14 (App Router)                      │     │
│  │                                                                │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐     │     │
│  │  │ Páginas  │ │ API Routes│ │Middleware │ │  Edge Config │     │     │
│  │  │ (SSR/ISR)│ │ (tRPC)   │ │ (Auth,    │ │  (Flags,     │     │     │
│  │  │          │ │          │ │  Redirect)│ │   Secrets)   │     │     │
│  │  └──────────┘ └────┬─────┘ └──────────┘ └──────────────┘     │     │
│  └─────────────────────┼──────────────────────────────────────────┘     │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Cloudflare  │ │    Redis     │
│  (Neon)      │ │  R2 (Imgs)  │ │  (Upstash)   │
│              │ │              │ │              │
│ • Dados      │ │ • Uploads    │ │ • Cache      │
│ • Pedidos    │ │ • Thumbnails │ │ • Session    │
│ • Catálogo   │ │ • Mockups    │ │ • Rate Limit │
│ • Usuários   │ │ • Produtos   │ │ • Jobs Queue │
└──────────────┘ └──────────────┘ └──────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Stripe /   │ │  Resend      │ │   Sentry     │
│  MercadoPago │ │  (Emails)    │ │  (Monitoring)│
│              │ │              │ │              │
│ • Cobrança   │ │ • Confirmaç. │ │ • Erros      │
│ • Webhooks   │ │ • Status     │ │ • Perf       │
│ • Estorno    │ │ • Marketing  │ │ • Replay     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 6. Roadmap de Desenvolvimento

### Fase 1 — Fundação (Semanas 1–2)
- [x] Inicializar monorepo Next.js + TypeScript + Tailwind + Shadcn/ui
- [ ] Configurar Prisma + PostgreSQL (schema inicial)
- [ ] Configurar NextAuth.js (login com credenciais)
- [ ] Configurar Cloudflare R2 / S3
- [ ] CI/CD básico (lint, type-check, deploy Vercel)

### Fase 2 — Vitrine (Semanas 3–4)
- [ ] Layout público (header, footer, navegação)
- [ ] Página inicial (banner, categorias, destaques)
- [ ] Página de listagem por categoria (com filtros e busca)
- [ ] Página de detalhes do produto (galeria, seletores, preço dinâmico)
- [ ] SSR/ISR otimizado para SEO

### Fase 3 — Carrinho & Checkout (Semanas 5–6)
- [ ] Zustand cart store (adicionar, remover, alterar qtd)
- [ ] Página de carrinho com resumo
- [ ] Engine de promoções (Compre X Pague Y, cupons)
- [ ] Página de checkout (endereço, revisão, pagamento)
- [ ] Integração Stripe/MercadoPago com webhooks
- [ ] Página de confirmação de pedido

### Fase 4 — Personalização (Semanas 7–8)
- [ ] Página de upload com drag-and-drop
- [ ] Ferramenta de crop (react-easy-crop)
- [ ] Preview com mockup realista (tamanho + acabamento)
- [ ] Configuração + adicionar ao carrinho
- [ ] Pipeline de processamento de imagem (Sharp + BullMQ)
- [ ] Geração de thumbnail + versão alta resolução

### Fase 5 — Área do Cliente (Semanas 9–10)
- [ ] Perfil do usuário (dados, endereços)
- [ ] Histórico de pedidos ("Meus Pedidos")
- [ ] Timeline visual do status do pedido
- [ ] Re-compra (adicionar pedido anterior ao carrinho)

### Fase 6 — Painel Admin (Semanas 11–13)
- [ ] Layout admin com sidebar de navegação
- [ ] Dashboard com métricas e gráficos (Recharts)
- [ ] Gerenciamento de pedidos (lista + detalhe + atualizar status)
- [ ] Download de imagens personalizadas (individual e em lote ZIP)
- [ ] CRUD de produtos e categorias
- [ ] Sistema de regras de promoção (CRUD completo)
- [ ] Sistema de cupons (CRUD completo)
- [ ] Proteção de rotas admin (middleware + role check)

### Fase 7 — Polimento & Lançamento (Semanas 14–16)
- [ ] Emails transacionais (confirmação, status, marketing)
- [ ] Testes E2E (Playwright)
- [ ] Otimização de performance (Lighthouse 90+)
- [ ] Monitoramento e alertas (Sentry)
- [ ] Analytics e funis (PostHog)
- [ ] Documentação do admin para o cliente
- [ ] Deploy de produção + domínio + SSL

---

## Anexo A — Estrutura de Pastas Recomendada

```
stickershop/
├── .github/
│   └── workflows/          # CI/CD (lint, test, deploy)
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── migrations/         # Migrations automáticas
├── public/
│   └── uploads/            # (dev apenas; produção usa R2/S3)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (public)/       # Rotas públicas (vitrine)
│   │   │   ├── page.tsx                        # Home
│   │   │   ├── produtos/[slug]/page.tsx        # Detalhe
│   │   │   ├── categorias/[slug]/page.tsx      # Listagem
│   │   │   ├── personalizar/page.tsx           # Upload
│   │   │   ├── carrinho/page.tsx               # Carrinho
│   │   │   └── checkout/page.tsx               # Checkout
│   │   ├── (auth)/          # Login/Cadastro
│   │   ├── (cliente)/       # Área do cliente
│   │   │   ├── meus-pedidos/
│   │   │   └── perfil/
│   │   ├── (admin)/         # Painel admin
│   │   │   ├── dashboard/
│   │   │   ├── pedidos/
│   │   │   ├── produtos/
│   │   │   ├── categorias/
│   │   │   ├── promocoes/
│   │   │   └── cupons/
│   │   └── api/             # API Routes (tRPC handlers)
│   ├── components/
│   │   ├── ui/              # Shadcn/ui components
│   │   ├── public/          # Componentes da vitrine
│   │   ├── admin/           # Componentes do painel
│   │   └── shared/          # Componentes compartilhados
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── auth.ts          # NextAuth config
│   │   ├── upload.ts        # S3/R2 helpers
│   │   ├── promocao-engine.ts  # Lógica de desconto
│   │   └── utils.ts
│   ├── stores/
│   │   └── cart.ts          # Zustand cart store
│   ├── hooks/               # Custom hooks
│   ├── emails/              # React Email templates
│   └── types/               # TypeScript types compartilhados
├── .env                     # Variáveis de ambiente
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## Anexo B — Políticas de Segurança Essenciais

| Área | Recomendação |
|---|---|
| **Upload de imagens** | Validar tipo MIME, extensão e tamanho no backend. Verificar com `file-type` (não confiar no `Content-Type` do cliente). Sanitizar metadados EXIF com Sharp |
| **Autenticação** | Senhas com bcrypt (cost 12+). Sessões JWT com rotação de refresh token. Rate-limit em /login (5 tentativas/min) |
| **Admin** | Middleware que verifica `role === 'admin'` em todas as rotas /admin. 2FA recomendado para admin |
| **API** | Rate limiting por IP (Upstash/Ratelimit). Input validation com Zod em toda rota. CSRF protection |
| **Dados** | Nunca expor `senha_hash`. Endereços e dados pessoais criptografados em repouso (pgcrypto ou aplicação) |
| **Pagamentos** | NUNCA trafegar dados de cartão pelo seu servidor. Usar tokenização do gateway (Stripe Elements / MercadoPago Checkout) |
| **CORS** | Restrito ao domínio da aplicação e gateway de pagamento |

---

> **Este documento é o ponto de partida.** Cada seção pode ser expandida em documentos próprios conforme o projeto avança. Recomendo começar pelo schema do Prisma e pelo protótipo das telas principais antes de qualquer código de backend.
