// Interfaces para o upload e processamento de XML NFe

export interface DadosNfe {
  chaveAcesso: string;
  numeroNota: string;
  serie: string;
  dataEmissao: string;
  valorTotal: number;
}

export interface FornecedorNfe {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  idFornecedor: number | null;
  encontrado: boolean;
}

export interface SugestaoProduto {
  idProduto: number;
  descricao: string;
  marca: string;
  codEan: string | null;
  codNcm: string;
  score: number;
}

export interface ItemNfe {
  numeroItem: number;
  codigoProdutoFornecedor: string;
  descricaoProduto: string;
  ncm: string;
  ean: string | null;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  produtoVinculado: boolean;
  idProdutoVinculado: number | null;
  descricaoProdutoVinculado: string | null;
  sugestoes: SugestaoProduto[];
}

export interface UploadXmlResponse {
  dadosNfe: DadosNfe;
  fornecedor: FornecedorNfe;
  itens: ItemNfe[];
  valorTotal: number;
  mensagem: string;
  totalItens: number;
  itensVinculados: number;
  itensNaoVinculados: number;
}

export interface VinculacaoProdutoRequest {
  numeroItem: number;
  idProduto: number;
}

export interface VinculacaoProdutoResponse {
  sucesso: boolean;
  mensagem: string;
  item?: ItemNfe;
}

// Interface para o estado do item na tela
export interface ItemRecebimentoXml extends ItemNfe {
  editandoPreco?: boolean;
  precoEditado?: number;
  produtoSelecionado?: any; // Produto selecionado da busca
  mostrarSugestoes?: boolean;
}
