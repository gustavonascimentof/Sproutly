import type { DayForecast } from '../domain/care';

interface OpenMeteoDaily {
  daily: { time: string[]; et0_fao_evapotranspiration: (number | null)[]; precipitation_sum: (number | null)[]; temperature_2m_max: (number | null)[]; uv_index_max: (number | null)[] };
}

export function normalizar(j: OpenMeteoDaily): DayForecast[] {
  const d = j.daily;
  return d.time.map((date, i) => ({
    date, et0: d.et0_fao_evapotranspiration[i] ?? 0, rain: d.precipitation_sum[i] ?? 0,
    tmax: d.temperature_2m_max[i] ?? 25, uv: d.uv_index_max[i] ?? 0,
  }));
}

/** Previsão de 3 dias via Open-Meteo (gratuito, sem chave, uso não comercial; dados CC BY 4.0). */
export async function buscarClima(lat: number, lon: number, f: typeof fetch = fetch): Promise<DayForecast[]> {
  const daily = 'et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max,uv_index_max';
  const r = await f(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${daily}&forecast_days=3&timezone=auto`);
  if (!r.ok) throw new Error(`Open-Meteo respondeu ${r.status}`);
  return normalizar(await r.json());
}

/** Usado quando não há rede: o app continua funcional, e a interface avisa. */
export const CLIMA_OFFLINE: DayForecast[] = [
  { date: '', et0: 4.5, rain: 0, tmax: 31, uv: 9 },
  { date: '', et0: 4.8, rain: 0, tmax: 33, uv: 9 },
  { date: '', et0: 3.2, rain: 6, tmax: 27, uv: 6 },
];
