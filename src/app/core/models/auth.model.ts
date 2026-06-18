export interface LoginRequest {
  email: string;
  senha: string;
}

export interface EmpresaResumo {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  ativo: boolean;
}

export interface LoginResponse {
  nome: string;
  token: string;
  tipo: string;
  empresas: EmpresaResumo[];
}

export interface UsuarioLogado {
  nome: string;
  token: string;
  role: 'ADMIN' | 'USER';
  empresas: EmpresaResumo[];
}
