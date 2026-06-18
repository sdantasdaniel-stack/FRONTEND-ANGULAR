export interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  ativo: boolean;
}

export interface EmpresaRequest {
  nome: string;
  cnpj: string;
  email: string;
}
