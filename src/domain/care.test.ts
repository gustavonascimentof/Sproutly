import { describe, it, expect } from 'vitest';
import { ESPECIES, projetarUmidade, precisaRegar, mlSugerido, aplicarRega, calcularSequencia, cuidadoCorreto, nivelDe, gerarInsight, chaveDia, type DayForecast } from './care';

const [manjericao, costela] = ESPECIES;
const quente: DayForecast = { date: 'a', et0: 5, rain: 0, tmax: 33, uv: 9 };
const chuva: DayForecast = { date: 'b', et0: 1, rain: 10, tmax: 24, uv: 3 };

describe('balanço hídrico', () => {
  it('seca mais rápido em dia quente e nunca passa de 0%', () => {
    const [d1] = projetarUmidade(60, manjericao, [quente]);
    expect(d1).toBeLessThan(60);
    expect(projetarUmidade(5, manjericao, [quente, quente])).toEqual([0, 0]);
  });
  it('chuva molha planta externa, mas não a de dentro de casa', () => {
    expect(projetarUmidade(50, manjericao, [chuva])[0]).toBeGreaterThan(50);
    expect(projetarUmidade(50, costela, [chuva])[0]).toBeLessThan(50);
  });
  it('sugere rega só quando abaixo do limite e a rega sobe a umidade sem passar de 100', () => {
    expect(precisaRegar(24, manjericao)).toBe(true);
    expect(precisaRegar(70, manjericao)).toBe(false);
    expect(mlSugerido(24, manjericao)).toBeGreaterThan(0);
    expect(aplicarRega(90, manjericao, 450)).toBe(100);
  });
  it('insight urgente quando o solo está seco', () => {
    expect(gerarInsight('Basil', manjericao, 20, [quente]).urgente).toBe(true);
  });
});

describe('streak saudável', () => {
  const dia = (n: number) => { const d = new Date(2026, 9, 15); d.setDate(d.getDate() - n); return chaveDia(d); };
  const hoje = new Date(2026, 9, 15);
  it('não regar quando não precisa conta; regar sem precisar não conta', () => {
    expect(cuidadoCorreto({ acao: 'checked', precisava: false })).toBe(true);
    expect(cuidadoCorreto({ acao: 'water', precisava: false })).toBe(false);
    expect(cuidadoCorreto({ acao: 'checked', precisava: true })).toBe(false);
  });
  it('conta dias seguidos e hoje pendente não quebra a sequência', () => {
    const logs = { [dia(1)]: { acao: 'water' as const, precisava: true }, [dia(2)]: { acao: 'checked' as const, precisava: false } };
    expect(calcularSequencia(logs, hoje)).toBe(2);
  });
  it('um dia errado quebra a sequência', () => {
    const logs = { [dia(0)]: { acao: 'water' as const, precisava: true }, [dia(1)]: { acao: 'water' as const, precisava: false }, [dia(2)]: { acao: 'water' as const, precisava: true } };
    expect(calcularSequencia(logs, hoje)).toBe(1);
  });
});

describe('nível', () => {
  it('340 XP no nível 1 faltam 160', () => expect(nivelDe(340)).toEqual({ nivel: 1, atual: 340, falta: 160 }));
});
