"""Football Live Dashboard – FastAPI Backend

Rodar:
    uvicorn main:app --reload --port 8000

A API real é buscada do FootAPI7 via RapidAPI.
Se a chave não estiver configurada ou a chamada falhar,
o sistema cai automaticamente no mock engine.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
from datetime import datetime, timezone
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

RAPIDAPI_KEY  = os.getenv("RAPIDAPI_KEY", "0bb9dde929msh28905c170d2d777p1ed558jsn2b2363e12e87")
RAPIDAPI_HOST = "footapi7.p.rapidapi.com"
API_BASE      = f"https://{RAPIDAPI_HOST}"
HEADERS       = {"x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST}

app = FastAPI(title="Football Live Dashboard", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Cliente HTTP
# ---------------------------------------------------------------------------

_http: httpx.AsyncClient | None = None


def get_http() -> httpx.AsyncClient:
    global _http
    if _http is None or _http.is_closed:
        _http = httpx.AsyncClient(timeout=10.0)
    return _http


# ---------------------------------------------------------------------------
# Normalização: FootAPI7 → formato interno
# ---------------------------------------------------------------------------
# A FootAPI7 usa a rota /api/matches/live (retorna jogos ao vivo)
# e /api/matches/{id}/statistics para stats de um jogo.

STATUS_MAP = {
    "inprogress": "LIVE",
    "1h": "LIVE",
    "2h": "LIVE",
    "ht": "LIVE",
    "et": "LIVE",
    "pen": "LIVE",
    "notstarted": "SCHEDULED",
    "finished": "FINISHED",
    "postponed": "FINISHED",
    "canceled": "FINISHED",
}


def _flag(country: str) -> str:
    """Converte código de país ISO em emoji de bandeira (melhor esforço)."""
    flags = {
        "england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "spain": "🇪🇸",
        "germany": "🇩🇪",
        "italy": "🇮🇹",
        "france": "🇫🇷",
        "brazil": "🇧🇷",
        "portugal": "🇵🇹",
        "netherlands": "🇳🇱",
        "europe": "⭐",
        "world": "🌍",
    }
    return flags.get((country or "").lower(), "⚽")


def _parse_score(score_dict: dict | None, side: str) -> int:
    if not score_dict:
        return 0
    val = score_dict.get("current") if score_dict.get("current") is not None else score_dict.get(side, 0)
    # FootAPI7 aninha: {"home": {"current": N}, "away": {"current": N}}
    if isinstance(val, dict):
        val = val.get("current", 0)
    return int(val or 0)


def _normalize_match(raw: dict) -> dict:
    """Converte um objeto de jogo da FootAPI7 para o formato do dashboard."""
    mid    = str(raw.get("id", raw.get("matchId", "")))
    home_t = raw.get("homeTeam", {})
    away_t = raw.get("awayTeam", {})
    score  = raw.get("homeScore", raw.get("score", {}))
    a_score = raw.get("awayScore", {})
    status_raw = (raw.get("status", {}).get("type") or "").lower()
    minute_val = raw.get("time", {}).get("current") or raw.get("status", {}).get("description", "0")
    try:
        minute = int(str(minute_val).replace("'", "").split("+")[0])
    except (ValueError, TypeError):
        minute = 0

    tournament = raw.get("tournament", {})
    league_name = tournament.get("name", "Futebol")
    category = tournament.get("category", {})
    country = category.get("name", "")

    # Placar
    if isinstance(score, dict) and "home" in score:
        home_goals = _parse_score(score.get("home"), "home")
        away_goals = _parse_score(score.get("away"), "away")
    else:
        home_goals = _parse_score(score, "home")
        away_goals = _parse_score(a_score, "away")

    return {
        "id": mid,
        "api_id": mid,
        "league": league_name,
        "league_logo": _flag(country),
        "home": {
            "name": home_t.get("name", "Casa"),
            "short": home_t.get("shortName", home_t.get("name", "HOM"))[:3].upper(),
            "logo": "🟡",
        },
        "away": {
            "name": away_t.get("name", "Visitante"),
            "short": away_t.get("shortName", away_t.get("name", "VIS"))[:3].upper(),
            "logo": "⚪",
        },
        "score": {"home": home_goals, "away": away_goals},
        "minute": minute,
        "status": STATUS_MAP.get(status_raw, "SCHEDULED"),
        "kickoff": raw.get("startTimestamp") and
                   datetime.fromtimestamp(raw["startTimestamp"], tz=timezone.utc).strftime("%H:%M"),
        "events": [],   # populado por _enrich_match_events
        "stats": _empty_stats(),
    }


def _empty_stats() -> dict:
    return {
        "possession":       [50, 50],
        "shots_on_target":  [0, 0],
        "shots_total":      [0, 0],
        "fouls":            [0, 0],
        "yellow_cards":     [0, 0],
        "red_cards":        [0, 0],
        "corners":          [0, 0],
        "offsides":         [0, 0],
    }


STAT_KEY_MAP = {
    "Ball possession": "possession",
    "Shots on goal":   "shots_on_target",
    "Total shots":     "shots_total",
    "Fouls":           "fouls",
    "Yellow cards":    "yellow_cards",
    "Red cards":       "red_cards",
    "Corner kicks":    "corners",
    "Offsides":        "offsides",
}


def _parse_stat_value(val: str | int | None) -> int:
    """Extrai inteiro de strings como '55%', '12', None."""
    if val is None:
        return 0
    s = str(val).replace("%", "").strip()
    try:
        return int(float(s))
    except ValueError:
        return 0


def _apply_statistics(match: dict, stats_raw: list[dict]) -> None:
    """Preenche match['stats'] a partir da resposta de /statistics."""
    for group in stats_raw:
        for item in group.get("statisticsItems", []):
            key = STAT_KEY_MAP.get(item.get("name", ""))
            if key:
                match["stats"][key] = [
                    _parse_stat_value(item.get("home")),
                    _parse_stat_value(item.get("away")),
                ]


# ---------------------------------------------------------------------------
# Chamadas à FootAPI7
# ---------------------------------------------------------------------------


async def _fetch_live_matches() -> list[dict]:
    """Busca todos os jogos ao vivo agora."""
    url = f"{API_BASE}/api/matches/live"
    try:
        r = await get_http().get(url, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        events = data.get("events") or data.get("matches") or []
        log.info(f"FootAPI7 live: {len(events)} jogos")
        return [_normalize_match(e) for e in events]
    except Exception as exc:
        log.warning(f"FootAPI7 live fetch falhou: {exc}")
        return []


async def _fetch_today_matches() -> list[dict]:
    """Busca todos os jogos do dia."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    url = f"{API_BASE}/api/matches/{today}"
    try:
        r = await get_http().get(url, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        events = data.get("events") or data.get("matches") or []
        log.info(f"FootAPI7 today: {len(events)} jogos")
        return [_normalize_match(e) for e in events]
    except Exception as exc:
        log.warning(f"FootAPI7 today fetch falhou: {exc}")
        return []


async def _fetch_match_stats(api_id: str) -> list[dict]:
    url = f"{API_BASE}/api/match/{api_id}/statistics"
    try:
        r = await get_http().get(url, headers=HEADERS)
        r.raise_for_status()
        data = r.json()
        return data.get("statistics") or []
    except Exception:
        return []


async def _enrich_live_stats(matches: list[dict]) -> None:
    """Busca estatísticas para jogos ao vivo (paralelizado)."""
    live = [m for m in matches if m["status"] == "LIVE"]
    tasks = [_fetch_match_stats(m["api_id"]) for m in live]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for match, stats_raw in zip(live, results):
        if isinstance(stats_raw, list):
            _apply_statistics(match, stats_raw)


# ---------------------------------------------------------------------------
# Estado global + Mock Fallback
# ---------------------------------------------------------------------------

_matches: list[dict[str, Any]] = []
_clients: list[WebSocket] = []
_using_real_api = False


MOCK_MATCHES: list[dict[str, Any]] = [
    {
        "id": "m1", "api_id": "m1",
        "league": "LaLiga", "league_logo": "🇪🇸",
        "home": {"name": "Real Madrid", "short": "RMA", "logo": "⚪"},
        "away": {"name": "Barcelona",   "short": "BAR", "logo": "🔵"},
        "score": {"home": 1, "away": 0}, "minute": 34, "status": "LIVE",
        "kickoff": None,
        "events": [{"minute": 12, "type": "goal", "team": "home", "player": "Vini Jr."}],
        "stats": {"possession": [58,42], "shots_on_target": [5,3], "shots_total": [9,6],
                  "fouls": [8,11], "yellow_cards": [1,2], "red_cards": [0,0],
                  "corners": [4,3], "offsides": [2,1]},
    },
    {
        "id": "m2", "api_id": "m2",
        "league": "Brasileirão", "league_logo": "🇧🇷",
        "home": {"name": "Flamengo",  "short": "FLA", "logo": "🔴"},
        "away": {"name": "Palmeiras", "short": "PAL", "logo": "🟢"},
        "score": {"home": 0, "away": 0}, "minute": 67, "status": "LIVE",
        "kickoff": None,
        "events": [],
        "stats": {"possession": [45,55], "shots_on_target": [2,4], "shots_total": [7,8],
                  "fouls": [14,10], "yellow_cards": [3,1], "red_cards": [0,0],
                  "corners": [5,6], "offsides": [3,2]},
    },
    {
        "id": "m3", "api_id": "m3",
        "league": "Premier League", "league_logo": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "home": {"name": "Manchester City", "short": "MCI", "logo": "🩵"},
        "away": {"name": "Arsenal",         "short": "ARS", "logo": "🔴"},
        "score": {"home": 2, "away": 2}, "minute": 78, "status": "LIVE",
        "kickoff": None,
        "events": [
            {"minute": 23, "type": "goal", "team": "home", "player": "Haaland"},
            {"minute": 41, "type": "goal", "team": "away", "player": "Saka"},
            {"minute": 55, "type": "goal", "team": "away", "player": "Martinelli"},
            {"minute": 78, "type": "goal", "team": "home", "player": "De Bruyne"},
        ],
        "stats": {"possession": [61,39], "shots_on_target": [7,5], "shots_total": [14,9],
                  "fouls": [9,13], "yellow_cards": [2,3], "red_cards": [0,1],
                  "corners": [8,4], "offsides": [1,3]},
    },
    {
        "id": "m4", "api_id": "m4",
        "league": "Champions League", "league_logo": "⭐",
        "home": {"name": "PSG",   "short": "PSG", "logo": "🔵"},
        "away": {"name": "Bayern", "short": "BAY", "logo": "🔴"},
        "score": {"home": 0, "away": 0}, "minute": 0, "status": "SCHEDULED",
        "kickoff": "21:00", "events": [],
        "stats": {"possession": [50,50], "shots_on_target": [0,0], "shots_total": [0,0],
                  "fouls": [0,0], "yellow_cards": [0,0], "red_cards": [0,0],
                  "corners": [0,0], "offsides": [0,0]},
    },
    {
        "id": "m5", "api_id": "m5",
        "league": "Serie A", "league_logo": "🇮🇹",
        "home": {"name": "Inter Milan", "short": "INT", "logo": "⚫"},
        "away": {"name": "AC Milan",   "short": "MIL", "logo": "🔴"},
        "score": {"home": 3, "away": 1}, "minute": 90, "status": "FINISHED",
        "kickoff": None,
        "events": [
            {"minute": 8,  "type": "goal", "team": "home", "player": "Lautaro"},
            {"minute": 33, "type": "goal", "team": "away", "player": "Leão"},
            {"minute": 61, "type": "goal", "team": "home", "player": "Thuram"},
            {"minute": 88, "type": "goal", "team": "home", "player": "Lautaro"},
        ],
        "stats": {"possession": [52,48], "shots_on_target": [9,4], "shots_total": [17,8],
                  "fouls": [11,15], "yellow_cards": [2,4], "red_cards": [0,0],
                  "corners": [7,3], "offsides": [2,4]},
    },
]

MOCK_PLAYERS = {
    "m1": {"home": ["Vini Jr.", "Mbappé", "Bellingham"], "away": ["Lewandowski", "Yamal", "Pedri"]},
    "m2": {"home": ["Gabigol", "Pedro", "Arrascaeta"],    "away": ["Endrick", "Rony", "Raphael Veiga"]},
    "m3": {"home": ["Haaland", "De Bruyne", "Foden"],     "away": ["Saka", "Martinelli", "Havertz"]},
}


async def _simulate_tick() -> None:
    for match in [m for m in _matches if m["status"] == "LIVE"]:
        mid = match["id"]
        match["minute"] = min(90, match["minute"] + random.randint(1, 3))
        if match["minute"] >= 90:
            match["status"] = "FINISHED"
            continue
        s = match["stats"]
        h = max(30, min(70, s["possession"][0] + random.randint(-2, 2)))
        s["possession"] = [h, 100 - h]
        for key in ("shots_on_target", "shots_total", "fouls", "corners", "offsides"):
            if random.random() < 0.3:
                s[key][random.randint(0, 1)] += 1
        if random.random() < 0.08 and mid in MOCK_PLAYERS:
            side = random.choice(["home", "away"])
            match["score"][side] += 1
            match["events"].append({
                "minute": match["minute"], "type": "goal", "team": side,
                "player": random.choice(MOCK_PLAYERS[mid][side]),
            })
        if random.random() < 0.05:
            s["yellow_cards"][random.randint(0, 1)] += 1


# ---------------------------------------------------------------------------
# Loop principal de atualização
# ---------------------------------------------------------------------------


async def _refresh_from_api() -> bool:
    """Tenta atualizar _matches com dados reais. Retorna True se obteve dados."""
    global _matches
    live   = await _fetch_live_matches()
    today  = await _fetch_today_matches()

    # Mescla: live tem prioridade sobre today
    live_ids = {m["id"] for m in live}
    merged = live + [m for m in today if m["id"] not in live_ids]

    if not merged:
        return False

    await _enrich_live_stats(merged)
    _matches = merged
    return True


async def _broadcast(payload: str) -> None:
    dead: list[WebSocket] = []
    for ws in list(_clients):
        try:
            await ws.send_text(payload)
        except Exception:
            dead.append(ws)
    for ws in dead:
        if ws in _clients:
            _clients.remove(ws)


async def _main_loop() -> None:
    global _using_real_api, _matches
    while True:
        await asyncio.sleep(15)
        if _using_real_api:
            ok = await _refresh_from_api()
            if not ok:
                log.warning("API real sem dados, mantendo estado anterior.")
        else:
            await _simulate_tick()

        if _clients and _matches:
            await _broadcast(json.dumps({"type": "matches_update", "data": _matches}))


@app.on_event("startup")
async def _startup() -> None:
    global _using_real_api, _matches
    log.info("Iniciando — tentando FootAPI7...")
    ok = await _refresh_from_api()
    if ok:
        _using_real_api = True
        log.info(f"FootAPI7 ativa — {len(_matches)} partidas carregadas.")
    else:
        _using_real_api = False
        _matches = json.loads(json.dumps(MOCK_MATCHES))
        log.info("FootAPI7 indisponível — mock engine ativado.")
    asyncio.create_task(_main_loop())


# ---------------------------------------------------------------------------
# REST Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/matches")
async def get_matches() -> dict[str, Any]:
    return {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "real" if _using_real_api else "mock",
        "matches": _matches,
    }


@app.get("/api/matches/{match_id}")
async def get_match(match_id: str) -> dict[str, Any]:
    for m in _matches:
        if m["id"] == match_id:
            return m
    return {"error": "not found"}


@app.get("/api/status")
async def api_status() -> dict[str, Any]:
    return {
        "source": "real" if _using_real_api else "mock",
        "matches_loaded": len(_matches),
        "clients_connected": len(_clients),
    }


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------


@app.websocket("/ws/live")
async def websocket_live(ws: WebSocket) -> None:
    await ws.accept()
    _clients.append(ws)
    await ws.send_text(json.dumps({"type": "matches_update", "data": _matches}))
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        if ws in _clients:
            _clients.remove(ws)
