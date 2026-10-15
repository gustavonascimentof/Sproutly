import { mlSugerido, precisaRegar, rotuloUmidade, type Species } from './care';

export interface EntradaPlanta { id: string; apelido: string; sp: Species; u: number }
export interface Missao { id: string; tipo: 'regar' | 'girar'; titulo: string; detalhe: string; xp: number; feita: boolean; plantaId: string }
export interface Meta { id: string; titulo: string; atual: number; alvo: number; xp: number }

export const chaveMissao = (hoje: string, tipo: string, id: string) => `${hoje}:${tipo}:${id}`;

/** Missões nascem das necessidades reais: rega para solo seco, giro para plantas de interior. */
export function missoesDoDia(ps: EntradaPlanta[], extras: Record<string, boolean>, hoje: string): Missao[] {
  const out: Missao[] = [];
  for (const p of ps) {
    const kr = chaveMissao(hoje, 'regar', p.id);
    if (precisaRegar(p.u, p.sp) || extras[kr])
      out.push({ id: kr, tipo: 'regar', titulo: `Regar ${p.apelido}`, plantaId: p.id, xp: 20, feita: !!extras[kr],
        detalhe: extras[kr] ? 'Rega concluída' : `${rotuloUmidade(p.u, p.sp)} · ${mlSugerido(p.u, p.sp)} ml recomendados` });
    if (!p.sp.externo) {
      const kg = chaveMissao(hoje, 'girar', p.id);
      out.push({ id: kg, tipo: 'girar', titulo: `Girar ${p.apelido} 90°`, plantaId: p.id, xp: 15, feita: !!extras[kg], detalhe: 'Luz uniforme evita caule inclinado' });
    }
  }
  return out;
}

export const metasSemanais = (sequencia: number, especies: number, cuidados: number): Meta[] => [
  { id: 'seq', titulo: 'Sequência de 7 dias de cuidado', atual: Math.min(sequencia, 7), alvo: 7, xp: 100 },
  { id: 'col', titulo: 'Coleção com 5 espécies diferentes', atual: Math.min(especies, 5), alvo: 5, xp: 80 },
  { id: 'cui', titulo: '10 regas registradas', atual: Math.min(cuidados, 10), alvo: 10, xp: 60 },
];

export const conquistas = (sequencia: number, especies: number, plantas: number) => [
  { id: 'primeira', titulo: 'Primeira planta', ok: plantas >= 1 },
  { id: 'hidratador', titulo: 'Hidratador 7 dias', ok: sequencia >= 7 },
  { id: 'colecionador', titulo: 'Colecionador de 5 espécies', ok: especies >= 5 },
  { id: 'jardim', titulo: 'Jardim com 5 plantas', ok: plantas >= 5 },
];
