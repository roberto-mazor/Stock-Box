import * as SQLite from 'expo-sqlite';
import { Product, ProductInput } from '../types';

// Abre o banco de dados de forma síncrona
const db = SQLite.openDatabaseSync('stockbox.db');

export const setupDatabase = (): void => {
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