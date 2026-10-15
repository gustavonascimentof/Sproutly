export interface Planta { id: string; apelido: string; especie: string; local: string; umidade: number; medidoEm: string; cuidados: number; foto?: string }
export interface RegistroDia { acao: 'water' | 'checked'; precisava: boolean }
export interface Estado { plantas: Planta[]; logs: Record<string, RegistroDia>; xp: number; extras: Record<string, boolean> }
