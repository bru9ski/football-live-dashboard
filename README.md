# ⚽ Football Live Dashboard v3

Dashboard de futebol ao vivo com **React + FastAPI**, WebSockets e integração real com a **FootAPI7** (RapidAPI).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Python + FastAPI |
| Comunicação | WebSocket (`/ws/live`) + fallback polling |
| Dados | FootAPI7 via RapidAPI (fallback: mock engine) |
| Estilo | CSS puro |

## Como rodar

### 1. Configure a chave da API

```bash
cd backend
cp .env.example .env
# .env já vem preenchido com sua chave
```

### 2. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/matches` | Lista todas as partidas do dia |
| GET | `/api/matches/{id}` | Detalhes de uma partida |
| GET | `/api/status` | Status da fonte de dados (real/mock) |
| WS | `/ws/live` | Stream ao vivo via WebSocket |

## Lógica de fonte de dados

```
Startup
  └→ tenta FootAPI7 (/api/matches/live + /api/matches/{data})
       ├→ [sucesso] usa dados reais + atualiza a cada 15s
       └→ [falha]   ativa mock engine dinâmico (simula gols, stats)
```

O campo `source` na resposta de `/api/matches` indica `"real"` ou `"mock"`.

## Estrutura

```
football-live-dashboard/
├── backend/
│   ├── main.py            # FastAPI + FootAPI7 + Mock fallback
│   ├── requirements.txt
│   ├── .env.example
│   └── .env               # Não commitado (está no .gitignore)
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── styles.css
    │   └── components/
    │       ├── Sidebar.jsx
    │       ├── Dashboard.jsx
    │       ├── MatchCard.jsx
    │       └── MatchDetails.jsx
    └── ...
```
