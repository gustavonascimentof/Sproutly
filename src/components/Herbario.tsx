import { useState } from 'react';
import { ESPECIES, nivelPlanta, type Species } from '../domain/care';
import type { Planta } from '../types';

type VM = Planta & { sp: Species; u: number };
export type NovaPlanta = Pick<Planta, 'apelido' | 'especie' | 'local' | 'foto'>;

function reduzir(file: File): Promise<string> {
  return new Promise((ok) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 320 / Math.max(img.width, img.height)); const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => ok('');
    img.src = url;
  });
}

export function Herbario({ plantas, onAdicionar }: { plantas: VM[]; onAdicionar: (p: NovaPlanta) => void }) {
  const [aberto, setAberto] = useState(false);
  const [foto, setFoto] = useState('');
  const [especie, setEspecie] = useState(ESPECIES[0].id);
  const [apelido, setApelido] = useState('');
  const [local, setLocal] = useState('');
  const achadas = ESPECIES.filter((s) => plantas.some((p) => p.especie === s.id)).length;

  const salvar = () => {
    onAdicionar({ apelido: apelido.trim() || ESPECIES.find((s) => s.id === especie)!.nome, especie, local: local.trim() || 'Em casa', foto: foto || undefined });
    setAberto(false); setFoto(''); setApelido(''); setLocal('');
  };

  return (<>
    <h1>Herbário 📖</h1>
    <p className="sub">Descubra, cuide e evolua suas plantinhas.</p>
    <section className="cartao">
      <h2>{achadas} de {ESPECIES.length} espécies <span className="selo">{Math.round((achadas / ESPECIES.length) * 100)}%</span></h2>
      <div className="barra"><i style={{ width: `${(achadas / ESPECIES.length) * 100}%` }} /></div>
    </section>

    {!aberto ? <button className="botao" onClick={() => setAberto(true)}>+ Adicionar planta</button> : (
      <section className="cartao form">
        <h2>Nova planta</h2>
        <label className="foto-input">{foto ? <img src={foto} alt="Prévia da planta" /> : <span>📷 Tirar ou escolher foto</span>}
          <input type="file" accept="image/*" capture="environment" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setFoto(await reduzir(f)); }} /></label>
        <label>Espécie<select value={especie} onChange={(e) => setEspecie(e.target.value)}>{ESPECIES.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></label>
        <small>A identificação automática pela foto entra no próximo marco. Por enquanto, confirme a espécie aqui.</small>
        <label>Apelido<input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Ex.: Basil Buddy" maxLength={20} /></label>
        <label>Onde ela fica?<input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Ex.: Varanda" maxLength={20} /></label>
        <button className="botao" onClick={salvar}>Salvar no Herbário (+30 XP)</button>
        <button className="link" onClick={() => setAberto(false)}>Cancelar</button>
      </section>)}

    <div className="grade">{ESPECIES.map((s, i) => {
      const mine = plantas.filter((p) => p.especie === s.id);
      const n = String(i + 1).padStart(3, '0');
      if (!mine.length) return (
        <article className="cartao bloqueada" key={s.id}><small>#{n} 🔒</small><div className="foto">?</div><h3>???</h3>
          <small>Adote uma planta da categoria {s.categoria.toLowerCase()} para desbloquear.</small></article>);
      const top = mine.reduce((a, b) => (b.cuidados > a.cuidados ? b : a));
      return (
        <article className="cartao" key={s.id}><small>#{n} <b className={`raro ${s.raridade}`}>{s.raridade}</b></small>
          <div className="foto">{top.foto ? <img src={top.foto} alt={top.apelido} /> : '🌿'}</div>
          <h3>{top.apelido}</h3><small>{s.nome}</small>
          <p className="estrelas" aria-label={`Nível ${nivelPlanta(top.cuidados)}`}>{'★'.repeat(nivelPlanta(top.cuidados))}</p>
          <span className="selo">{s.categoria}</span></article>);
    })}</div>
  </>);
}
