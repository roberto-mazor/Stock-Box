import * as SQLite from 'expo-sqlite';
import { Product, ProductInput } from '../types';

const db = SQLite.openDatabaseSync('stockbox_v4.db');

export const setupDatabase = (): void => {
  // 1. Cria a tabela se ela não existir
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      image_url TEXT
    );
  `);

  // 2. Verifica se a tabela já possui algum produto cadastrado
  const countResult = db.getFirstSync<{ total: number }>('SELECT COUNT(*) as total FROM products;');
  
  // 3. Se estiver zerada (primeira execução), insere os itens demonstrativos fixes
  if (countResult && countResult.total === 0) {
    const demoProducts: ProductInput[] = [
      {
        name: 'Mouse Gamer RGB',
        description: 'Mouse óptico ergonômico com até 12000 DPI e cabo trançado.',
        quantity: 15,
        price: 129.90,
        image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80'
      },
      {
        name: 'Teclado Mecânico Switch Blue',
        description: 'Teclado compacto layout ANSI com retroiluminação LED interna.',
        quantity: 8,
        price: 249.00,
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'
      },
      {
        name: 'Headset Bluetooth Premium',
        description: 'Fone de ouvido com cancelamento de ruído ativo e bateria de 40h.',
        quantity: 5,
        price: 399.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
      },
      {
        name: 'Caneca "Mussum Ipsum"',
        description: 'Caneca de porcelana preta 320ml para café forte enquanto codifica.',
        quantity: 42,
        price: 35.00,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'
      },
      {
        name: 'Luminária Articulada Smart',
        description: 'Luminária com ajuste de temperatura de cor e compatível com comandos de voz.',
        quantity: 12,
        price: 89.90,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80'
      },
      {
        name: 'Furadeira de Impacto Teste',
        description: 'Item de teste para validação de carregamento de imagem no grid local',
        quantity: 10,
        price: 349.90,
        image_url: 'https://m.media-amazon.com/images/I/71EP9kWvS0L._AC_SL1500_.jpg'
      }
    ];

    // Executa a inserção em lote para popular o banco local
    for (const prod of demoProducts) {
      db.runSync(
        'INSERT INTO products (name, description, quantity, price, image_url) VALUES (?, ?, ?, ?, ?);',
        [prod.name, prod.description, prod.quantity, prod.price, prod.image_url]
      );
    }
    console.log('Produtos demonstrativos carregados com sucesso no SQLite!');
  }
};

export const database = {
  getAll: (): Product[] => {
    return db.getAllSync<Product>('SELECT * FROM products ORDER BY id DESC;');
  },

  getFiltered: (name: string): Product[] => {
    return db.getAllSync<Product>('SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC;', [`%${name}%`]);
  },

  getById: (id: number): Product | null => {
    return db.getFirstSync<Product>('SELECT * FROM products WHERE id = ?;', [id]);
  },

  insert: (product: ProductInput) => {
    const { name, description, quantity, price, image_url } = product;
    return db.runSync(
      'INSERT INTO products (name, description, quantity, price, image_url) VALUES (?, ?, ?, ?, ?);',
      [name, description, quantity, price, image_url]
    );
  },

  update: (id: number, product: ProductInput) => {
    const { name, description, quantity, price, image_url } = product;
    return db.runSync(
      'UPDATE products SET name = ?, description = ?, quantity = ?, price = ?, image_url = ? WHERE id = ?;',
      [name, description, quantity, price, image_url, id]
    );
  }
};