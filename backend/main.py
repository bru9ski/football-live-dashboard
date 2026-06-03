"""Football Live Dashboard – FastAPI Backend

Rodar:
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
import json
import random
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

app = FastAPI(title="Football Live Dashboard", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Mock Data Engine
# ---------------------------------------------------------------------------
# Para substituir por dados reais, implemente a interface MatchProvider
# e troque `_provider` em get_provider().

INITIAL_MATCHES: list[dict[str, Any]] = [
    {
        "id": "m1",
        "league": "LaLiga",
        "league_logo": "🇪🇸",
        "home": {"name": "Real Madrid", "short": "RMA", "logo": "⚪"},
        "away": {"name": "Barcelona", "short": "BAR", "logo": "🔵"},
        "score": {"home": 1, "away": 0},
        "minute": 34,
        "status": "LIVE",
        "events": [
            {"minute": 12, "type": "goal", "team": "home", "player": "Vini Jr."},
        ],
        "stats": {
            "possession": [58, 42],
            "shots_on_target": [5, 3],
            "shots_total": [9, 6],
            "fouls": [8, 11],
            "yellow_cards": [1, 2],
            "red_cards": [0, 0],
            "corners": [4, 3],
            "offsides": [2, 1],
        },
    },
    {
        "id": "m2",
        "league": "Brasileirão",
        "league_logo": "🇧🇷",
        "home": {"name": "Flamengo", "short": "FLA", "logo": "🔴"},
        "away": {"name": "Palmeiras", "short": "PAL", "logo": "🟢"},
        "score": {"home": 0, "away": 0},
        "minute": 67,
        "status": "LIVE",
        "events": [],
        "stats": {
            "possession": [45, 55],
            "shots_on_target": [2, 4],
            "shots_total": [7, 8],
            "fouls": [14, 10],
            "yellow_cards": [3, 1],
            "red_cards": [0, 0],
            "corners": [5, 6],
            "offsides": [3, 2],
        },
    },
    {
        "id": "m3",
        "league": "Premier League",
        "league_logo": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "home": {"name": "Manchester City", "short": "MCI", "logo": "🩵"},
        "away": {"name": "Arsenal", "short": "ARS", "logo": "🔴"},
        "score": {"home": 2, "away": 2},
        "minute": 90,
        "status": "LIVE",
        "events": [
            {"minute": 23, "type": "goal", "team": "home", "player": "Haaland"},
            {"minute": 41, "type": "goal", "team": "away", "player": "Saka"},
            {"minute": 55, "type": "goal", "team": "away", "player": "Martinelli"},
            {"minute": 78, "type": "goal", "team": "home", "player": "De Bruyne"},
        ],
        "stats": {
            "possession": [61, 39],
            "shots_on_target": [7, 5],
            "shots_total": [14, 9],
            "fouls": [9, 13],
            "yellow_cards": [2, 3],
            "red_cards": [0, 1],
            "corners": [8, 4],
            "offsides": [1, 3],
        },
    },
    {
        "id": "m4",
        "league": "Champions League",
        "league_logo": "⭐",
        "home": {"name": "PSG", "short": "PSG", "logo": "🔵"},
        "away": {"name": "Bayern", "short": "BAY", "logo": "🔴"},
        "score": {"home": 0, "away": 0},
        "minute": 0,
        "status": "SCHEDULED",
        "kickoff": "21:00",
        "events": [],
        "stats": {
            "possession": [50, 50],
            "shots_on_target": [0, 0],
            "shots_total": [0, 0],
            "fouls": [0, 0],
            "yellow_cards": [0, 0],
            "red_cards": [0, 0],
            "corners": [0, 0],
            "offsides": [0, 0],
        },
    },
    {
        "id": "m5",
        "league": "Serie A",
        "league_logo": "🇮🇹",
        "home": {"name": "Inter Milan", "short": "INT", "logo": "⚫"},
        "away": {"name": "AC Milan", "short": "MIL", "logo": "🔴"},
        "score": {"home": 3, "away": 1},
        "minute": 90,
        "status": "FINISHED",
        "events": [
            {"minute": 8, "type": "goal", "team": "home", "player": "Lautaro"},
            {"minute": 33, "type": "goal", "team": "away", "player": "Leão"},
            {"minute": 61, "type": "goal", "team": "home", "player": "Thuram"},
            {"minute": 88, "type": "goal", "team": "home", "player": "Lautaro"},
        ],
        "stats": {
            "possession": [52, 48],
            "shots_on_target": [9, 4],
            "shots_total": [17, 8],
            "fouls": [11, 15],
            "yellow_cards": [2, 4],
            "red_cards": [0, 0],
            "corners": [7, 3],
            "offsides": [2, 4],
        },
    },
]

# players para sorteio de gols simulados
MOCK_PLAYERS = {
    "m1": {"home": ["Vini Jr.", "Mbappé", "Bellingham"], "away": ["Lewandowski", "Yamal", "Pedri"]},
    "m2": {"home": ["Gabigol", "Pedro", "Arrascaeta"], "away": ["Endrick", "Rony", "Raphael Veiga"]},
    "m3": {"home": ["Haaland", "De Bruyne", "Foden"], "away": ["Saka", "Martinelli", "Havertz"]},
}

# Estado mutável central
_matches: list[dict[str, Any]] = json.loads(json.dumps(INITIAL_MATCHES))
_clients: list[WebSocket] = []


def _get_live_matches() -> list[dict[str, Any]]:
    return [m for m in _matches if m["status"] == "LIVE"]


async def _simulate_tick() -> None:
    """Avança o estado dos jogos ao vivo."""
    for match in _get_live_matches():
        mid = match["id"]
        match["minute"] = min(90, match["minute"] + random.randint(1, 3))

        # Finaliza jogo ao atingir 90'
        if match["minute"] >= 90:
            match["status"] = "FINISHED"
            continue

        # Atualiza estatísticas dinâmicas
        stats = match["stats"]
        h_pos = stats["possession"][0] + random.randint(-2, 2)
        h_pos = max(30, min(70, h_pos))
        stats["possession"] = [h_pos, 100 - h_pos]

        for key in ("shots_on_target", "shots_total", "fouls", "corners", "offsides"):
            if random.random() < 0.3:
                side = random.randint(0, 1)
                stats[key][side] += 1

        # Gol (probabilidade baixa ~8%)
        if random.random() < 0.08 and mid in MOCK_PLAYERS:
            side = random.choice(["home", "away"])
            player = random.choice(MOCK_PLAYERS[mid][side])
            match["score"][side] += 1
            match["events"].append(
                {"minute": match["minute"], "type": "goal", "team": side, "player": player}
            )

        # Cartão amarelo (5%)
        if random.random() < 0.05:
            side_idx = random.randint(0, 1)
            stats["yellow_cards"][side_idx] += 1


async def _broadcast_loop() -> None:
    """Loop de simulação + broadcast para todos os WebSocket conectados."""
    while True:
        await asyncio.sleep(10)
        await _simulate_tick()
        if _clients:
            payload = json.dumps({"type": "matches_update", "data": _matches})
            dead: list[WebSocket] = []
            for ws in list(_clients):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                _clients.remove(ws)


@app.on_event("startup")
async def _startup() -> None:
    asyncio.create_task(_broadcast_loop())


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/matches")
async def get_matches() -> dict[str, Any]:
    return {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "matches": _matches,
    }


@app.get("/api/matches/{match_id}")
async def get_match(match_id: str) -> dict[str, Any]:
    for m in _matches:
        if m["id"] == match_id:
            return m
    return {"error": "not found"}


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------


@app.websocket("/ws/live")
async def websocket_live(ws: WebSocket) -> None:
    await ws.accept()
    _clients.append(ws)
    # Envia estado atual imediatamente
    await ws.send_text(json.dumps({"type": "matches_update", "data": _matches}))
    try:
        while True:
            # Mantém conexão viva aguardando pings do cliente
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in _clients:
            _clients.remove(ws)
