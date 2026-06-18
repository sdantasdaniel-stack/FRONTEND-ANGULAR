export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
  ativo: boolean;
  empresasIds: number[];
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  role: 'ADMIN' | 'USER';
  empresasIds: number[];
}
