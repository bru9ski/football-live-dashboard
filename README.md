# ⚽ Football Live Dashboard v2

Dashboard de futebol ao vivo com **React + FastAPI**, WebSockets, mock engine e UI dark no estilo SofaScore.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python + FastAPI |
| Comunicação | WebSocket nativo (`/ws/live`) + fallback polling |
| Dados | Mock engine dinâmico (substituível por API real) |
| Estilo | CSS puro (sem Tailwind/Material UI) |

## Como rodar

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Funcionalidades

- 🔴 Indicador de jogo ao vivo com bolinha piscando
- ⚽ Animação CSS de gol (flash verde no card e no placar)
- 📊 Estatísticas em barras duplas animadas
- 📅 Cronologia de eventos por jogo
- 🔌 WebSocket com reconexão automática e fallback para polling
- 📱 Responsivo (sidebar recolhida em tablet/mobile)
- 🔄 Substituível por API real (API-Football, SportMonks etc.)

## Estrutura

```
football-live-dashboard/
├── backend/
│   ├── main.py           # FastAPI + Mock Engine + WebSocket
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.mts
    └── src/
        ├── main.jsx
        ├── App.jsx           # Estado global + WebSocket
        ├── styles.css        # Dark sports UI
        └── components/
            ├── Sidebar.jsx
            ├── Dashboard.jsx
            ├── MatchCard.jsx
            └── MatchDetails.jsx
```

## Substituindo pelo API-Football

No `main.py`, na função `get_matches()`, substitua `_matches` pela chamada:

```python
# Exemplo com httpx (pip install httpx)
import httpx

async def fetch_real_matches():
    async with httpx.AsyncClient() as client:
        r = await client.get(
            "https://v3.football.api-sports.io/fixtures",
            headers={"x-apisports-key": "SEU_TOKEN"},
            params={"date": datetime.today().strftime("%Y-%m-%d"), "live": "all"}
        )
    return r.json()["response"]
```
