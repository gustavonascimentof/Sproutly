import type { Meta, Missao } from '../domain/missions';

interface Props {
  missoes: Missao[]; metas: Meta[]; resgatadas: Record<string, boolean>; semana: string;
  conquistas: { id: string; titulo: string; ok: boolean }[];
  onConcluir: (m: Missao) => void; onResgatar: (m: Meta, chave: string) => void;
}

export function Missoes({ missoes, metas, resgatadas, semana, conquistas, onConcluir, onResgatar }: Props) {
  const feitas = missoes.filter((m) => m.feita).length;
  return (<>
    <h1>Missões & Desafios 🌱</h1>
    <p className="sub">Cuide de verdade, ganhe XP e suba de nível.</p>
    <section className="cartao"><h2>Hoje <span className="selo">{feitas} de {missoes.length} concluídas</span></h2>
      <div className="barra"><i style={{ width: `${missoes.length ? (feitas / missoes.length) * 100 : 0}%` }} /></div></section>

    <h2 className="secao">Tarefas diárias</h2>
    {missoes.length === 0 && <section className="cartao vazio"><p>Nenhuma planta precisa de você agora. Volte amanhã!</p></section>}
    {missoes.map((m) => (
      <section className={`cartao missao ${m.feita ? 'concluida' : ''}`} key={m.id}>
        <h3>{m.titulo} <b className="xp">+{m.xp} XP</b></h3><p>{m.detalhe}</p>
        <button className="botao" disabled={m.feita} onClick={() => onConcluir(m)}>{m.feita ? 'Feito ✓' : m.tipo === 'regar' ? 'Regar agora' : 'Concluir'}</button>
      </section>))}

    <h2 className="secao">Metas da semana</h2>
    {metas.map((m) => { const chave = `sem:${semana}:${m.id}`; const pronta = m.atual >= m.alvo;
      return (<section className="cartao" key={m.id}><h3>{m.titulo} <span className="selo">{m.atual}/{m.alvo}</span></h3>
        <div className="barra"><i style={{ width: `${(m.atual / m.alvo) * 100}%` }} /></div>
        <button className="botao" disabled={!pronta || resgatadas[chave]} onClick={() => onResgatar(m, chave)}>{resgatadas[chave] ? 'Resgatado ✓' : pronta ? `Resgatar +${m.xp} XP` : `Recompensa: +${m.xp} XP`}</button></section>); })}

    <h2 className="secao">Conquistas</h2>
    <div className="grade">{conquistas.map((c) => <article key={c.id} className={`cartao selo-conq ${c.ok ? '' : 'bloqueada'}`}><div className="foto">{c.ok ? '🏅' : '🔒'}</div><h3>{c.titulo}</h3></article>)}</div>

    <section className="cartao aviso-sim"><h3>Liga e Meta Coletiva</h3><p>Entram quando a comunidade existir. Para o MVP, o foco é o cuidado individual.</p></section>
  </>);
}
