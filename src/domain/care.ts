/** Núcleo de domínio do Sproutly: funções puras, sem React e sem rede. */

export interface Species {
  id: string; nome: string; cientifico: string;
  /** Coeficiente de cultura (Kc): escala a evapotranspiração de referência. Valor heurístico, a calibrar. */
  kc: number;
  /** "Reservatório" do vaso em mm equivalentes de ET0. */
  capacidadeMm: number;
  capacidadeMl: number;
  /** Abaixo deste % de umidade a planta precisa de rega. */
  limite: number;
  /** Se recebe chuva (varanda/quintal) ou fica dentro de casa. */
  externo: boolean;
  luz: string;
  raridade: 'Comum' | 'Incomum' | 'Raro';
  categoria: string;
}

export interface DayForecast { date: string; et0: number; rain: number; tmax: number; uv: number }

export const ESPECIES: Species[] = [
  { id: 'manjericao', nome: 'Manjericão', cientifico: 'Ocimum basilicum', kc: 1.1, capacidadeMm: 40, capacidadeMl: 450, limite: 40, externo: true, luz: '6h ou mais de sol', raridade: 'Comum', categoria: 'Erva' },
  { id: 'costela', nome: 'Costela-de-Adão', cientifico: 'Monstera deliciosa', kc: 0.7, capacidadeMm: 60, capacidadeMl: 600, limite: 30, externo: false, luz: 'Luz difusa', raridade: 'Raro', categoria: 'Folhagem' },
  { id: 'alecrim', nome: 'Alecrim', cientifico: 'Salvia rosmarinus', kc: 0.6, capacidadeMm: 55, capacidadeMl: 500, limite: 25, externo: true, luz: 'Sol pleno', raridade: 'Incomum', categoria: 'Erva' },
  { id: 'hortela', nome: 'Hortelã', cientifico: 'Mentha spicata', kc: 1.0, capacidadeMm: 45, capacidadeMl: 450, limite: 40, externo: true, luz: 'Sol e meia-sombra', raridade: 'Comum', categoria: 'Erva' },
  { id: 'tomate', nome: 'Tomate-cereja', cientifico: 'Solanum lycopersicum', kc: 1.15, capacidadeMm: 50, capacidadeMl: 800, limite: 40, externo: true, luz: 'Sol pleno', raridade: 'Incomum', categoria: 'Frutífera' },
  { id: 'lavanda', nome: 'Lavanda', cientifico: 'Lavandula angustifolia', kc: 0.6, capacidadeMm: 50, capacidadeMl: 450, limite: 25, externo: true, luz: 'Sol pleno', raridade: 'Raro', categoria: 'Aroma' },
  { id: 'cebolinha', nome: 'Cebolinha', cientifico: 'Allium schoenoprasum', kc: 0.9, capacidadeMm: 40, capacidadeMl: 400, limite: 40, externo: true, luz: 'Sol e meia-sombra', raridade: 'Comum', categoria: 'Erva' },
  { id: 'echeveria', nome: 'Echeveria', cientifico: 'Echeveria elegans', kc: 0.3, capacidadeMm: 70, capacidadeMl: 300, limite: 15, externo: false, luz: 'Muita luz indireta', raridade: 'Incomum', categoria: 'Suculenta' },
];

const limitar = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const arredondar = (v: number) => Math.round(v * 10) / 10;

/** Variação diária de umidade (em pontos percentuais): chuva só conta para plantas externas. */
export function variacaoDia(sp: Species, d: DayForecast): number {
  const perda = d.et0 * sp.kc;
  const ganho = sp.externo ? d.rain * 0.6 : 0;
  return ((ganho - perda) * 100) / sp.capacidadeMm;
}

export function projetarUmidade(u0: number, sp: Species, dias: DayForecast[]): number[] {
  let u = u0;
  return dias.map((d) => (u = arredondar(limitar(u + variacaoDia(sp, d)))));
}

/** Aplica N dias sem rega usando a ET0 média como aproximação (limite: 7 dias). */
export function envelhecer(u: number, sp: Species, dias: number, et0: number): number {
  return arredondar(limitar(u - (Math.min(dias, 7) * et0 * sp.kc * 100) / sp.capacidadeMm));
}

export const precisaRegar = (u: number, sp: Species) => u < sp.limite;
export const mlSugerido = (u: number, sp: Species) => Math.max(0, Math.round(((80 - u) / 100) * sp.capacidadeMl / 10) * 10);
export const aplicarRega = (u: number, sp: Species, ml: number) => arredondar(limitar(u + (ml / sp.capacidadeMl) * 100));

export const rotuloUmidade = (u: number, sp: Species) =>
  precisaRegar(u, sp) ? 'Solo seco' : u < 60 ? 'Solo úmido' : 'Solo encharcado';

export interface Insight { texto: string; urgente: boolean }

/** Insight por regras: o app funciona sem LLM; um LLM pode apenas reescrever este texto. */
export function gerarInsight(apelido: string, sp: Species, u: number, previsao: DayForecast[]): Insight {
  const amanha = previsao[1] ?? previsao[0];
  if (precisaRegar(u, sp)) {
    const quando = previsao[0]?.tmax >= 30 ? 'no fim da tarde, quando o sol baixar' : 'agora de manhã';
    return { urgente: true, texto: `Estou com sede! Me dá ${mlSugerido(u, sp)} ml ${quando}.` };
  }
  if (amanha && sp.externo && amanha.rain >= 5) {
    return { urgente: false, texto: 'Vem chuva por aí. Pode guardar o regador, eu me viro.' };
  }
  if (amanha && amanha.tmax >= 32) {
    return { urgente: false, texto: `Amanhã vai fazer ${Math.round(amanha.tmax)}°C. Fica de olho em mim ao meio-dia, ${apelido} aqui agradece.` };
  }
  return { urgente: false, texto: 'Tudo em dia por aqui. Hoje é só me dar um oi.' };
}

/* ---------- Streak saudável ---------- */

export type Acao = 'water' | 'checked';
export interface RegistroDia { acao: Acao; precisava: boolean }

/** Dia correto = regou quando precisava OU conferiu e não regou quando não precisava. */
export const cuidadoCorreto = (r: RegistroDia) => (r.precisava ? r.acao === 'water' : r.acao === 'checked');

export const chaveDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Hoje pendente não quebra a sequência; só um dia passado errado ou vazio quebra. */
export function calcularSequencia(logs: Record<string, RegistroDia>, hoje: Date): number {
  const d = new Date(hoje);
  if (!logs[chaveDia(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  for (let r = logs[chaveDia(d)]; r && cuidadoCorreto(r); r = logs[chaveDia(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ---------- XP e nível ---------- */

export const XP_POR_NIVEL = 500;
export const nivelDe = (xp: number) => ({ nivel: Math.floor(xp / XP_POR_NIVEL) + 1, atual: xp % XP_POR_NIVEL, falta: XP_POR_NIVEL - (xp % XP_POR_NIVEL) });

/** Nível da planta sobe a cada 3 regas corretas (máx. 5). */
export const nivelPlanta = (cuidados: number) => Math.min(5, 1 + Math.floor(cuidados / 3));
