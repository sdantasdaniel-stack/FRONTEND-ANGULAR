export interface Device {
  id: number;
  nome: string;
  identificador: string;
  status: 'ONLINE' | 'OFFLINE';
  ativo: boolean;
  empresaId: number;
  latitude: number | null;
  longitude: number | null;
}

export interface DeviceRequest {
  nome: string;
  identificador: string;
  empresaId: number;
  latitude: number | null;
  longitude: number | null;
}
