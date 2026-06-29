# 📦 Stock-Box - Sistema de Gerenciamento de Estoque

## 🎯 Visão Geral do Projeto

**Stock-Box** é uma aplicação mobile desenvolvida com **Expo** e **React Native** para gerenciar estoques de produtos de forma simples e eficiente. A aplicação permite cadastrar, visualizar, editar e buscar produtos com informações completas como nome, descrição, quantidade, preço e imagem.

O app foi construído com **TypeScript** para maior segurança de tipos e usa **SQLite local** como banco de dados, garantindo que os dados persistem no dispositivo do usuário.

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura em camadas com separação clara de responsabilidades:

```
Stock-Box/
├── app/                    # Telas e rotas (Expo Router)
│   ├── _layout.tsx         # Layout principal e inicialização
│   ├── index.tsx           # Tela home (listagem)
│   ├── detail.tsx          # Tela de detalhes do produto
│   └── form.tsx            # Tela de cadastro/edição
│
├── src/                    # Lógica de negócio
│   ├── database/
│   │   └── database.ts     # CRUD e conexão SQLite
│   └── types/
│       └── index.ts        # Interfaces TypeScript
│
└── assets/                 # Imagens e ícones
```

---

## 📚 Dependências Principais

### Framework & Runtime
- **expo**: `~56.0.12` - Framework para desenvolvimento React Native multiplataforma
- **react**: `19.2.3` - Biblioteca UI
- **react-native**: `0.85.3` - Framework nativo para mobile

### Roteamento & Navegação
- **expo-router**: `^56.2.11` - Roteamento baseado em arquivos (file-based routing)
- **@react-navigation/native**: `^7.3.3` - Navegação nativa
- **@react-navigation/native-stack**: `^7.17.5` - Stack navigator
- **react-native-screens**: `^4.25.2` - Otimizações de navegação
- **react-native-safe-area-context**: `~5.7.0` - Gerencia áreas seguras (notches, câmeras)

### Banco de Dados
- **expo-sqlite**: `~56.0.5` - Database SQLite local para persistência de dados

### Utilitários
- **expo-constants**: `^56.0.18` - Constantes e configurações do app
- **expo-linking**: `^56.0.14` - Deep linking e navegação profunda
- **expo-status-bar**: `~56.0.4` - Controle da barra de status

### Tipagem
- **@types/react**: `~19.2.14` - Type definitions para React
- **typescript**: `~6.0.3` - Linguagem de tipagem estática

---

## 🗂️ Estrutura de Dados

### Tipos TypeScript (`src/types/index.ts`)

#### `Product` - Modelo completo do banco de dados
```typescript
interface Product {
  id: number;                    // ID único gerado automaticamente
  name: string;                  // Nome do produto (obrigatório)
  description: string | null;    // Descrição (opcional)
  quantity: number;              // Quantidade em estoque
  price: number;                 // Preço unitário
  image_url: string | null;      // URL da imagem (opcional)
}
```

#### `ProductInput` - Modelo para cadastro/edição
```typescript
interface ProductInput {
  name: string;                  // Nome do produto
  description: string;           // Descrição
  quantity: number;              // Quantidade
  price: number;                 // Preço
  image_url: string;             // URL da imagem
}
```

---

## 💾 Sistema de Banco de Dados (`src/database/database.ts`)

### Inicialização: `setupDatabase()`

A função `setupDatabase()` é executada na inicialização da aplicação e realiza:

1. **Criação da tabela** `products` com a seguinte estrutura:
   ```sql
   CREATE TABLE IF NOT EXISTS products (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     description TEXT,
     quantity INTEGER NOT NULL,
     price REAL NOT NULL,
     image_url TEXT
   );
   ```

2. **Verificação de dados iniciais**: Se a tabela estiver vazia (primeira execução), insere 6 produtos demonstrativos:
   - Mouse Gamer RGB
   - Teclado Mecânico Switch Blue
   - Headset Bluetooth Premium
   - Caneca "Mussum Ipsum"
   - Luminária Articulada Smart
   - Furadeira de Impacto Teste

### Operações CRUD: Objeto `database`

#### `database.getAll()` - Busca todos os produtos
```typescript
getAll: (): Product[] => {
  return db.getAllSync<Product>('SELECT * FROM products ORDER BY id DESC;');
}
```
- Retorna array de produtos ordenado por ID descendente
- Usado na tela home quando não há filtro

#### `database.getFiltered(name)` - Busca por nome
```typescript
getFiltered: (name: string): Product[] => {
  return db.getAllSync<Product>('SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC;', [`%${name}%`]);
}
```
- Busca parcial case-insensitive usando `LIKE`
- Usado no campo de filtro da home

#### `database.getById(id)` - Busca produto específico
```typescript
getById: (id: number): Product | null => {
  return db.getFirstSync<Product>('SELECT * FROM products WHERE id = ?;', [id]);
}
```
- Retorna um produto ou `null` se não encontrado
- Usado nas telas de detalhe e edição

#### `database.insert(product)` - Cadastro novo
```typescript
insert: (product: ProductInput) => {
  return db.runSync(
    'INSERT INTO products (name, description, quantity, price, image_url) VALUES (?, ?, ?, ?, ?);',
    [name, description, quantity, price, image_url]
  );
}
```
- Insere novo produto na tabela
- Parâmetros protegidos contra SQL injection

#### `database.update(id, product)` - Atualização
```typescript
update: (id: number, product: ProductInput) => {
  return db.runSync(
    'UPDATE products SET name = ?, description = ?, quantity = ?, price = ?, image_url = ? WHERE id = ?;',
    [name, description, quantity, price, image_url, id]
  );
}
```
- Atualiza produto existente
- Identificado pelo ID

---

## 📱 Telas e Componentes

### 1️⃣ Layout Principal (`app/_layout.tsx`)

**Responsabilidade**: Inicialização e estrutura de roteamento

**Hooks utilizados**:
- `useEffect()` - Executa `setupDatabase()` na primeira renderização

**Fluxo**:
1. Ao montar o componente, chama `setupDatabase()` para preparar o banco
2. Define a estrutura Stack com 3 telas (index, detail, form)
3. Desativa o header padrão para customização manual

```typescript
useEffect(() => {
  setupDatabase(); // Inicializa o SQLite
}, []);
```

---

### 2️⃣ Tela Home - Listagem (`app/index.tsx`)

**Responsabilidade**: Exibir lista de produtos com busca, filtro e resumo

**Estados**:
- `products: Product[]` - Array de produtos a exibir
- `search: string` - Termo de busca
- `imageErrors: Record<number, boolean>` - Rastreia erros de carregamento de imagens

**Hooks principais**:
- `useState()` - Gerencia estado local
- `useCallback()` - Memoiza função de carregamento
- `useFocusEffect()` - Recarrega dados ao voltar para a tela
- `useSafeAreaInsets()` - Calcula espaçamento seguro

**Funções principais**:

#### `loadProducts()`
```typescript
const loadProducts = useCallback(() => {
  const data = search ? database.getFiltered(search) : database.getAll();
  setProducts(data);
}, [search]);
```
- Se há termo de busca, filtra produtos por nome
- Caso contrário, carrega todos
- Chamada sempre que volta para a tela (via `useFocusEffect`)

#### Cálculos dinâmicos
```typescript
const totalProducts = products.length;
const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
```
- Calcula quantidade total de produtos
- Calcula valor total em estoque (preço × quantidade de cada produto)

**Renderização**:
- **Header**: Título "stock box" centralizado
- **Campo de filtro**: Input com busca por nome (debounce via onChange)
- **Resumo**: Exibe total de produtos e valor total
- **Grid de produtos**: FlatList com 2 colunas
  - Cada card mostra imagem, nome e quantidade
  - Ao clicar, navega para tela de detalhes
  - Imagem com fallback: se falhar, mostra placeholder

```typescript
<FlatList
  data={products}
  numColumns={2}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => router.push({ pathname: '/detail', params: { productId: item.id } })}>
      <Image 
        source={hasValidUrl && !hasError ? { uri: item.image_url } : require('../assets/placeholder.png')}
        onError={() => setImageErrors(prev => ({ ...prev, [item.id]: true }))}
      />
      {/* ... card content */}
    </TouchableOpacity>
  )}
/>
```

- **Botão "Adicionar Produto"**: Flutuante no rodapé, navega para `/form`

---

### 3️⃣ Tela de Detalhes (`app/detail.tsx`)

**Responsabilidade**: Exibir informações completas de um produto com opções de edição

**Estados**:
- `product: Product | null` - Produto carregado

**Parâmetros de rota**:
- `productId: string` - ID do produto (vem da rota)

**Hooks**:
- `useFocusEffect()` - Recarrega dados do banco ao retornar à tela
- `useLocalSearchParams()` - Captura parâmetros da rota

**Fluxo**:
1. Ao montar ou voltar para a tela, busca o produto via `database.getById()`
2. Se não encontrado, exibe "Carregando..."
3. Calcula valor total do estoque: `grossValue = price × quantity`

**Elementos da UI**:

#### Header com navegação
```typescript
<View style={styles.header}>
  <TouchableOpacity onPress={() => router.back()}>
    <Text>← Voltar</Text>
  </TouchableOpacity>
  <Text>Detalhes</Text>
  <TouchableOpacity onPress={() => router.push({ pathname: '/form', params: { productId: product.id } })}>
    <Text>✏️ Editar</Text>
  </TouchableOpacity>
</View>
```

#### Imagem do produto
```typescript
<Image 
  source={product.image_url ? { uri: product.image_url } : require('../assets/placeholder.png')}
/>
```

#### Card de informações
- **Nome** (grande e destaque)
- **Quantidade em Estoque** (ex: "15 un.")
- **Preço Unitário** (azul: R$ 129.90)
- **Valor Total do Estoque** (verde: R$ 1948.50)

#### Descrição
- Exibida apenas se o produto tiver descrição (conditional rendering)

---

### 4️⃣ Tela de Formulário (`app/form.tsx`)

**Responsabilidade**: Cadastro e edição de produtos

**Estados**:
- `imageUrl: string`
- `name: string`
- `description: string`
- `quantity: string`
- `price: string`

**Parâmetros de rota**:
- `productId?: string` - Opcional; se presente, é modo edição

**Hooks**:
- `useEffect()` - Carrega dados do produto se em modo edição
- `useLocalSearchParams()` - Captura ID da rota

**Fluxo**:

#### Modo Edição vs. Novo Cadastro
```typescript
useEffect(() => {
  if (productId) {
    const product = database.getById(Number(productId));
    if (product) {
      setImageUrl(product.image_url || '');
      setName(product.name);
      // ... preenche outros campos
    }
  }
}, [productId]);
```

#### Validação e Salvamento: `handleSave()`
```typescript
const handleSave = () => {
  if (!name || !quantity || !price) {
    Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
    return;
  }

  const productData = {
    name,
    description,
    quantity: parseInt(quantity, 10) || 0,
    price: parseFloat(price) || 0,
    image_url: imageUrl
  };

  if (productId) {
    database.update(Number(productId), productData);
  } else {
    database.insert(productData);
  }

  router.replace('/');
};
```

- Valida campos obrigatórios (name, quantity, price)
- Converte strings de número para tipos numéricos
- Usa `database.insert()` para novo ou `database.update()` para edição
- Retorna à home via `router.replace('/')`

**Campos de Input**:
1. URL da imagem (opcional)
2. Nome do produto (obrigatório)
3. Descrição (opcional)
4. Quantidade (obrigatório, teclado numérico)
5. Preço (obrigatório, teclado numérico)

---

## 🔄 Fluxo de Dados da Aplicação

```
┌─────────────────────────────────────────────────────┐
│          INICIALIZAÇÃO (Layout)                      │
│     setupDatabase() - cria tabela e seed            │
└────────────────────────┬────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        v                v                v
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │   HOME     │  │  DETAIL    │  │   FORM     │
   │  (index)   │  │           │  │           │
   └────────────┘  └────────────┘  └────────────┘
        │                │                │
        │                │                │
  Clica em card   Clica em Editar   Clica em + ou Editar
        │                │                │
        └────────────────┴────────────────┘
                         │
                    router.push()
                         │
                    Navega para tela
                         │
                    useFocusEffect()
                         │
              Carrega dados do banco
```

---

## 🎨 Estilos e UX

- **Cores principais**:
  - Azul: `#4c7de7` (botões primários)
  - Verde: `#10b981` (valores de estoque)
  - Cinza: `#e5e7eb` (bordas e backgrounds)
  - Escuro: `#1f2937` (textos principais)

- **Grid de 2 colunas** na home para melhor aproveitamento de espaço
- **Safe Area Context** para respeitar notches e câmeras de celulares
- **Scroll virtualized** com FlatList para performance
- **Fallback de imagens** com placeholder local

---

## 🚀 Como Executar

```bash
npm start          # Inicia dev server Expo
npm run android    # Compila para Android
npm run ios        # Compila para iOS
npm run web        # Executa versão web
```

---

## 📋 Resumo de Funcionalidades

✅ Listar todos os produtos  
✅ Buscar produto por nome (filtro live)  
✅ Visualizar detalhes completos do produto  
✅ Cadastrar novo produto  
✅ Editar produto existente  
✅ Cálculo automático de valor total em estoque  
✅ Suporte a imagens externas (com fallback)  
✅ Dados persistem localmente no SQLite  
✅ Interface responsiva com Safe Area  
✅ Navegação suave com Expo Router
