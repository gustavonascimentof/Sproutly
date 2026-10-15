# Sproutly 🌱 (nome provisório)

PWA que transforma o cuidado com plantas caseiras em jogo: um companion que conversa, sequência de cuidado, XP e missões geradas a partir do **clima real** da sua região. Projeto da disciplina UPx (Facens, 2026/S2).

## Estado do MVP 
| Recurso | Situação |
|---|---|
| Home (companion, sequência, XP, missões, plantas) | Funcionando, salva no navegador |
| Motor de cuidado (balanço hídrico com ET0 do Open-Meteo) | Funcionando e testado |
| Streak saudável (não regar sem precisar também conta) | Funcionando e testado |
| Herbário (coleção, níveis, cadastro com foto e espécie confirmada) | Funcionando |
| Missões & Desafios (diárias geradas pelas necessidades, metas semanais, conquistas) | Funcionando |
| Comunidade, Ajustes | Próximos marcos (abas já existem) |
| Reconhecimento automático por foto (PlantNet) | Pendente: exige chave e função serverless. Hoje o usuário escolhe a espécie |

## Como rodar
Requisitos: Node 20+ (testado com 22).
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes do domínio
npm run build    # gera dist/
```

## Arquitetura
```
src/domain/care.ts      regras puras (balanço hídrico, streak, XP) sem React nem rede
src/services/weather.ts Open-Meteo: busca e normalização, com fallback offline
src/App.tsx             interface e estado (persistido em localStorage)
```
**Motor de cuidado:** a cada dia, `variação = (chuva × 0,6 − ET0 × Kc) × 100 / capacidade`. A chuva só vale para plantas externas. O texto do companion é gerado por regras, então o app funciona sem LLM; um LLM poderá apenas reescrever esse texto.

## Limitações conhecidas
- Kc, capacidade e limites por espécie são valores heurísticos e ainda precisam de calibração agronômica.
- A umidade é estimada, não medida; dias sem abrir o app usam a ET0 de hoje como aproximação.
- Dados de exemplo (3 plantas) até existir o cadastro por foto.

## Créditos e licenças de dados
Clima: [Open-Meteo](https://open-meteo.com) (CC BY 4.0, uso não comercial). Identificação de plantas (planejado): [Pl@ntNet](https://plantnet.org), com atribuição.

