// Modelo do Produto completo vindo do Banco de Dados
export interface Product {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  image_url: string | null;
}

// Modelo dos dados que serão enviados no cadastro/edição (Sem exigir o ID)
export interface ProductInput {
  name: string;
  description: string;
  quantity: number;
  price: number;
  image_url: string;
}