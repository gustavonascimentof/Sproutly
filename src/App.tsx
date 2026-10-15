import { useEffect, useMemo, useState } from 'react';
import { ESPECIES, aplicarRega, calcularSequencia, chaveDia, envelhecer, gerarInsight, mlSugerido, nivelDe, precisaRegar, rotuloUmidade, type DayForecast, type RegistroDia } from './domain/care';
import { CLIMA_OFFLINE, buscarClima } from './services/weather';
import { Mascote } from './components/Mascote';

interface Planta { id: string; apelido: string; especie: string; local: string; umidade: number; medidoEm: string }
interface Estado { plantas: Planta[]; logs: Record<string, RegistroDia>; xp: number }

const hojeChave = () => chaveDia(new Date());
const INICIAL: Estado = {
  xp: 340, logs: {},
  plantas: [
    { id: 'p1', apelido: 'Basil Buddy', especie: 'manjericao', local: 'Cozinha', umidade: 24, medidoEm: hojeChave() },
    { id: 'p2', apelido: 'Monty', especie: 'costela', local: 'Sala', umidade: 62, medidoEm: hojeChave() },
    { id: 'p3', apelido: 'Rosie', especie: 'alecrim', local: 'Varanda', umidade: 48, medidoEm: hojeChave() },
  ],
};

function usePersistido(): [Estado, (f: (e: Estado) => Estado) => void] {
  const [estado, setEstado] = useState<Estado>(() => {
    try { return JSON.parse(localStorage.getItem('sproutly:v1') ?? '') as Estado; } catch { return INICIAL; }
  });
  useEffect(() => { try { localStorage.setItem('sproutly:v1', JSON.stringify(estado)); } catch { /* armazenamento indisponível */ } }, [estado]);
  return [estado, (f) => setEstado(f)];
}

const Gota = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></svg>;
const ABAS = ['Dex', 'Missões', 'Home', 'Comunidade', 'Ajustes'] as const;

export default function App() {
  const [estado, atualizar] = usePersistido();
  const [clima, setClima] = useState<DayForecast[]>(CLIMA_OFFLINE);
  const [online, setOnline] = useState(false);
  const [aba, setAba] = useState<(typeof ABAS)[number]>('Home');

  useEffect(() => {
    const ok = (p?: GeolocationPosition) => buscarClima(p?.coords.latitude ?? -23.5, p?.coords.longitude ?? -47.45).then((c) => { setClima(c); setOnline(true); }).catch(() => setOnline(false));
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(ok, () => ok(), { maximumAge: 3600000 }) : ok();
  }, []);

  // Umidade atual = última medição envelhecida pelos dias decorridos.
  const plantas = useMemo(() => estado.plantas.map((p) => {
    const sp = ESPECIES.find((e) => e.id === p.especie)!;
    const dias = Math.round((new Date(hojeChave()).getTime() - new Date(p.medidoEm).getTime()) / 864e5);
    const u = dias > 0 ? envelhecer(p.umidade, sp, dias, clima[0].et0) : p.umidade;
    return { ...p, sp, u, insight: gerarInsight(p.apelido, sp, u, clima) };
  }), [estado.plantas, clima]);

  const hoje = hojeChave();
  const registroHoje = estado.logs[hoje];
  const sequencia = calcularSequencia(estado.logs, new Date());
  const lvl = nivelDe(estado.xp);
  const destaque = plantas.find((p) => precisaRegar(p.u, p.sp)) ?? plantas[0];
  const precisam = plantas.filter((p) => precisaRegar(p.u, p.sp)).length;

  const regar = (id: string) => atualizar((e) => {
    const alvo = plantas.find((p) => p.id === id)!;
    const ml = mlSugerido(alvo.u, alvo.sp);
    return { ...e, xp: e.xp + 20,
      logs: { ...e.logs, [hoje]: { acao: 'water', precisava: true } },
      plantas: e.plantas.map((p) => (p.id === id ? { ...p, umidade: aplicarRega(alvo.u, alvo.sp, ml), medidoEm: hoje } : p)) };
  });
  const conferir = () => atualizar((e) => ({ ...e, xp: e.xp + 15, logs: { ...e.logs, [hoje]: { acao: 'checked', precisava: precisam > 0 } } }));

  const semana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((nome, i) => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
    const r = estado.logs[chaveDia(d)];
    return { nome, feito: !!r, hoje: chaveDia(d) === hoje };
  });

  return (
    <div className="app">
      <header className="topo">
        <span className="marca"><Mascote />Sproutly</span>
        <span className="pilulas"><b>🔥 {sequencia}d</b><b>☀️ {estado.xp}</b><b>Lv.{lvl.nivel}</b></span>
      </header>

      <main>
        {aba !== 'Home' ? (
          <section className="cartao vazio"><h2>{aba}</h2><p>Esta tela entra na próxima etapa do MVP.</p></section>
        ) : (<>
          <h1>Bom dia! 🌱</h1>
          <p className="sub">{precisam === 0 ? 'Suas plantinhas estão em dia hoje.' : `${precisam} plantinha${precisam > 1 ? 's' : ''} precisa${precisam > 1 ? 'm' : ''} de atenção hoje`}</p>
          {!online && <p className="aviso" role="status">Sem conexão com o clima: usando previsão de exemplo.</p>}

          <section className="cartao companion">
            <Mascote sede={precisaRegar(destaque.u, destaque.sp)} />
            <div>
              <h2>{destaque.apelido}<small>{destaque.sp.nome}</small></h2>
              <p className="balao">{destaque.insight.texto}</p>
              <div className="barra" role="progressbar" aria-valuenow={Math.round(destaque.u)} aria-valuemin={0} aria-valuemax={100} aria-label="Hidratação"><i style={{ width: `${destaque.u}%` }} className={precisaRegar(destaque.u, destaque.sp) ? 'seca' : ''} /></div>
              <small>Hidratação {Math.round(destaque.u)}% · {rotuloUmidade(destaque.u, destaque.sp)}</small>
            </div>
          </section>

          <section className="cartao">
            <h2>Sequência de cuidado <span className="selo">{sequencia} dias seguidos</span></h2>
            <div className="semana">{semana.map((d) => <span key={d.nome} className={`dia ${d.feito ? 'feito' : ''} ${d.hoje ? 'hoje' : ''}`}><Gota />{d.nome}</span>)}</div>
            <p className="nota">Não regar quando não precisa também mantém a sequência.</p>
          </section>

          <section className="cartao">
            <h2>Nível {lvl.nivel} <span className="selo">{lvl.atual}/500 XP</span></h2>
            <div className="barra"><i style={{ width: `${(lvl.atual / 500) * 100}%` }} /></div>
            <small>Faltam {lvl.falta} XP para o próximo nível</small>
          </section>

          <h2 className="secao">Missões de hoje</h2>
          {plantas.filter((p) => precisaRegar(p.u, p.sp)).map((p) => (
            <section className="cartao missao" key={p.id}>
              <div><h3>Regar {p.apelido}</h3><p>{rotuloUmidade(p.u, p.sp)} · {mlSugerido(p.u, p.sp)} ml recomendados <b className="xp">+20 XP</b></p></div>
              <button className="botao" onClick={() => regar(p.id)}><Gota /> Regar agora ({mlSugerido(p.u, p.sp)} ml)</button>
            </section>
          ))}
          {precisam === 0 && (
            <section className="cartao missao"><div><h3>Conferir as plantas</h3><p>Nenhuma precisa de rega hoje <b className="xp">+15 XP</b></p></div>
              <button className="botao" disabled={!!registroHoje} onClick={conferir}>{registroHoje ? 'Conferido hoje' : 'Conferi, está tudo certo'}</button></section>
          )}

          <h2 className="secao">Minhas plantinhas ({plantas.length})</h2>
          <div className="carrossel">{plantas.map((p) => (
            <article className="cartao planta" key={p.id}><div className="foto">🌿</div>
              <h3>{p.apelido}</h3><p><i>{p.sp.cientifico}</i></p>
              <p className={precisaRegar(p.u, p.sp) ? 'alerta' : 'ok'}>{precisaRegar(p.u, p.sp) ? 'Necessita água' : 'Tudo em dia'} · {p.local}</p></article>
          ))}</div>
        </>)}
      </main>

      <nav className="abas" aria-label="Navegação principal">{ABAS.map((a) => (
        <button key={a} className={a === aba ? 'ativa' : ''} aria-current={a === aba ? 'page' : undefined} onClick={() => setAba(a)}>{a}</button>))}</nav>
    </div>
  );
}
