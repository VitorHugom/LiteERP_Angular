// Modelo para pedido simplificado (usado na busca)
export interface PedidoBuscaDTO {
  id: number;
  nomeCliente: string;
  nomeVendedor: string;
  dataEmissao: Date; // Sempre convertido para Date pelo servico
  status: string;
}

// Modelo completo de pedido
export interface Pedido {
  id: number | null;
  cliente: any;
  vendedor: any;
  dataEmissao: string | Date;
  valorTotal: number | null;
  status: string;
  tipoCobranca: any;
  itens: any[];
}

// Interface para resposta paginada de pedidos
export interface PedidosBuscaResponse {
  content: PedidoBuscaDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  last: boolean;
  totalElements: number;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

