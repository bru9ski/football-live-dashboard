# Football Live Dashboard

Dashboard interativo premium para análise esportiva ao vivo. Interface minimalista com fundo preto, construída com **React + FastAPI**.

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Python FastAPI
- **Estilo**: CSS puro (modular por camadas)
- **Persistência**: JSON (backend) + localStorage (frontend)

## Como rodar localmente

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173` com o backend rodando em `http://localhost:8000`.

## Estrutura

```
football-live-dashboard/
├── backend/
│   ├── app.py          # FastAPI + rotas REST
│   ├── models.py       # Pydantic models
│   ├── storage.py      # JSON persistence
│   ├── requirements.txt
│   └── data/           # Dados em JSON (criado automaticamente)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.mts
    └── src/
        ├── App.jsx
        ├── api/client.js
        ├── context/ThemeContext.jsx
        ├── components/  # Layout, Sidebar, Topbar, Cards, Modal...
        ├── pages/       # Landing, Dashboard, Statistics, Alerts, History, Settings
        └── styles/      # globals, theme, layout, components
```

## Funcionalidades

- Landing com animação e loading premium
- Sidebar fixa no desktop, drawer no mobile
- Dashboard com métricas, destaque ao vivo e CRUD de registros
- Estatísticas por categoria e severidade
- Página de alertas filtrada
- Histórico cronológico
- Configurações: tema claro/escuro, notificações, modo compacto, limpar dados
- Comunicação frontend ↔ backend via Axios
- Persistência dupla: localStorage + JSON via API
