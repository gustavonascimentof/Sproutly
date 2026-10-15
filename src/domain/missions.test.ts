import { describe, it, expect } from 'vitest';
import { ESPECIES, nivelPlanta } from './care';
import { missoesDoDia, metasSemanais, chaveMissao } from './missions';

const [manj, costela] = ESPECIES;
describe('missões do dia', () => {
  it('gera rega só para solo seco e giro só para planta de interior', () => {
    const m = missoesDoDia([{ id: 'a', apelido: 'A', sp: manj, u: 20 }, { id: 'b', apelido: 'B', sp: manj, u: 80 }, { id: 'c', apelido: 'C', sp: costela, u: 80 }], {}, 'd');
    expect(m.map((x) => x.id)).toEqual(['d:regar:a', 'd:girar:c']);
  });
  it('mantém a missão de rega como feita depois de regar', () => {
    const m = missoesDoDia([{ id: 'a', apelido: 'A', sp: manj, u: 85 }], { [chaveMissao('d', 'regar', 'a')]: true }, 'd');
    expect(m[0].feita).toBe(true);
  });
  it('limita o progresso das metas ao alvo', () => expect(metasSemanais(30, 1, 3)[0].atual).toBe(7));
  it('planta sobe de nível a cada 3 cuidados, até 5', () => { expect(nivelPlanta(0)).toBe(1); expect(nivelPlanta(6)).toBe(3); expect(nivelPlanta(99)).toBe(5); });
});
