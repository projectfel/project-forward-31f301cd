import store1 from "@/assets/store-1.jpg";
import store2 from "@/assets/store-2.jpg";
import store3 from "@/assets/store-3.jpg";

export interface Product {
  id: string;
  nome: string;
  preco: number;
  precoOriginal?: number;
  categoria: string;
  imagem?: string;
  unidade?: string;
  destaque?: boolean;
  emEstoque?: boolean;
}

export interface Combo {
  id: string;
  nome: string;
  descricao: string;
  precoCombo: number;
  precoOriginal: number;
  itens: string[];
  imagem?: string;
}

export interface Supermarket {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  distancia: string;
  aberto: boolean;
  horario: string;
  avaliacao: number;
  totalAvaliacoes: number;
  whatsapp: string;
  imagem: string;
  logo?: string;
  categorias: string[];
  taxaEntrega: number;
  pedidoMinimo: number;
  tempoEntregaMin: number;
  tempoEntregaMax: number;
  produtos: Product[];
  combos: Combo[];
}

export const categorias = [
  { id: "1", nome: "Hortifruti", icone: "🥬" },
  { id: "2", nome: "Padaria", icone: "🍞" },
  { id: "3", nome: "Bebidas", icone: "🥤" },
  { id: "4", nome: "Limpeza", icone: "🧹" },
  { id: "5", nome: "Mercearia", icone: "🛒" },
  { id: "6", nome: "Carnes", icone: "🥩" },
  { id: "7", nome: "Laticínios", icone: "🧀" },
  { id: "8", nome: "Higiene", icone: "🧴" },
];

export const supermarkets: Supermarket[] = [
  {
    id: "1",
    nome: "Super Bairro Bezerra",
    descricao: "O mercado mais completo do bairro, com produtos frescos todos os dias.",
    endereco: "Lagoa Azul - Conj. Boa Esperança",
    distancia: "350m",
    aberto: true,
    horario: "07:00 - 21:00",
    avaliacao: 4.7,
    totalAvaliacoes: 234,
    whatsapp: "5584987837125",
    imagem: store1,
    categorias: ["Mercearia", "Hortifruti", "Padaria", "Bebidas", "Limpeza"],
    taxaEntrega: 3.5,
    pedidoMinimo: 15,
    tempoEntregaMin: 25,
    tempoEntregaMax: 45,
    produtos: [
      { id: "1", nome: "Feijão Carioca 1kg", preco: 7.5, categoria: "Mercearia", unidade: "1kg" },
      { id: "2", nome: "Arroz Branco 1kg", preco: 5.2, categoria: "Mercearia", unidade: "1kg" },
      { id: "3", nome: "Óleo de Soja 900ml", preco: 6.8, precoOriginal: 8.5, categoria: "Mercearia", unidade: "900ml", destaque: true },
      { id: "4", nome: "Café Tradicional 250g", preco: 8.9, categoria: "Mercearia", unidade: "250g" },
      { id: "5", nome: "Açúcar Cristal 1kg", preco: 4.5, categoria: "Mercearia", unidade: "1kg" },
      { id: "6", nome: "Macarrão Espaguete 500g", preco: 3.8, categoria: "Mercearia", unidade: "500g" },
      { id: "7", nome: "Leite Integral 1L", preco: 5.9, categoria: "Bebidas", unidade: "1L" },
      { id: "8", nome: "Suco de Laranja 1L", preco: 7.2, precoOriginal: 9.9, categoria: "Bebidas", unidade: "1L", destaque: true },
      { id: "9", nome: "Banana Prata", preco: 5.5, categoria: "Hortifruti", unidade: "kg" },
      { id: "10", nome: "Tomate", preco: 6.9, categoria: "Hortifruti", unidade: "kg" },
      { id: "11", nome: "Pão Francês", preco: 0.75, categoria: "Padaria", unidade: "un" },
      { id: "12", nome: "Detergente 500ml", preco: 2.9, categoria: "Limpeza", unidade: "500ml" },
    ],
    combos: [
      {
        id: "c1",
        nome: "Cesta Básica Essencial",
        descricao: "Arroz, feijão, óleo e café — o essencial do mês",
        precoCombo: 24.9,
        precoOriginal: 28.4,
        itens: ["Arroz 1kg", "Feijão 1kg", "Óleo 900ml", "Café 250g"],
      },
      {
        id: "c2",
        nome: "Kit Café da Manhã",
        descricao: "Pão, leite e café para começar bem o dia",
        precoCombo: 12.9,
        precoOriginal: 15.54,
        itens: ["Pão Francês x10", "Leite 1L", "Café 250g"],
      },
    ],
  },
  {
    id: "2",
    nome: "Mercearia do João",
    descricao: "Tradição e qualidade desde 1998. Hortifruti fresco direto do produtor.",
    endereco: "Lagoa Azul - Rua São Paulo, 42",
    distancia: "500m",
    aberto: true,
    horario: "06:30 - 20:00",
    avaliacao: 4.5,
    totalAvaliacoes: 189,
    whatsapp: "5584987837125",
    imagem: store2,
    categorias: ["Mercearia", "Hortifruti", "Bebidas"],
    taxaEntrega: 2.5,
    pedidoMinimo: 10,
    tempoEntregaMin: 20,
    tempoEntregaMax: 40,
    produtos: [
      { id: "1", nome: "Feijão Carioca 1kg", preco: 7.2, categoria: "Mercearia", unidade: "1kg" },
      { id: "2", nome: "Arroz Branco 1kg", preco: 5.5, categoria: "Mercearia", unidade: "1kg" },
      { id: "3", nome: "Óleo de Soja 900ml", preco: 6.5, categoria: "Mercearia", unidade: "900ml" },
      { id: "4", nome: "Café Tradicional 250g", preco: 9.2, categoria: "Mercearia", unidade: "250g" },
      { id: "5", nome: "Farinha de Trigo 1kg", preco: 4.8, precoOriginal: 6.2, categoria: "Mercearia", unidade: "1kg", destaque: true },
      { id: "6", nome: "Água Mineral 1.5L", preco: 2.5, categoria: "Bebidas", unidade: "1.5L" },
      { id: "7", nome: "Refrigerante 2L", preco: 8.5, categoria: "Bebidas", unidade: "2L" },
      { id: "8", nome: "Cebola", preco: 4.9, categoria: "Hortifruti", unidade: "kg" },
      { id: "9", nome: "Batata", preco: 5.8, categoria: "Hortifruti", unidade: "kg" },
    ],
    combos: [
      {
        id: "c3",
        nome: "Feira da Semana",
        descricao: "Cebola, batata e mais para sua semana",
        precoCombo: 18.9,
        precoOriginal: 22.2,
        itens: ["Cebola 2kg", "Batata 2kg", "Feijão 1kg"],
      },
    ],
  },
  {
    id: "3",
    nome: "Supermercado Boa Vista",
    descricao: "Variedade e preço justo. Frios, padaria artesanal e muito mais.",
    endereco: "Lagoa Azul - Av. Principal, 120",
    distancia: "800m",
    aberto: false,
    horario: "07:00 - 19:00",
    avaliacao: 4.3,
    totalAvaliacoes: 156,
    whatsapp: "5584987837125",
    imagem: store3,
    categorias: ["Mercearia", "Hortifruti", "Padaria", "Bebidas", "Limpeza", "Frios"],
    taxaEntrega: 4.0,
    pedidoMinimo: 20,
    tempoEntregaMin: 30,
    tempoEntregaMax: 60,
    produtos: [
      { id: "1", nome: "Feijão Preto 1kg", preco: 7.8, categoria: "Mercearia", unidade: "1kg" },
      { id: "2", nome: "Arroz Parboilizado 1kg", preco: 5.0, categoria: "Mercearia", unidade: "1kg" },
      { id: "3", nome: "Azeite de Oliva 500ml", preco: 22.9, precoOriginal: 28.9, categoria: "Mercearia", unidade: "500ml", destaque: true },
      { id: "4", nome: "Presunto Fatiado 200g", preco: 8.5, categoria: "Frios", unidade: "200g" },
      { id: "5", nome: "Queijo Mussarela 200g", preco: 9.9, categoria: "Frios", unidade: "200g" },
      { id: "6", nome: "Sabão em Pó 1kg", preco: 12.5, categoria: "Limpeza", unidade: "1kg" },
      { id: "7", nome: "Alface", preco: 2.5, categoria: "Hortifruti", unidade: "un" },
      { id: "8", nome: "Pão de Forma", preco: 7.9, categoria: "Padaria", unidade: "un" },
    ],
    combos: [],
  },
];
