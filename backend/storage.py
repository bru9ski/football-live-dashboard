import json
from pathlib import Path
from typing import List, Dict, Any

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

RECORDS_FILE = DATA_DIR / "records.json"
SETTINGS_FILE = DATA_DIR / "settings.json"


def _read_json(path: Path, default: Any):
    if not path.exists():
        return default
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json(path: Path, data: Any):
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)


def load_records() -> List[Dict[str, Any]]:
    return _read_json(RECORDS_FILE, [])


def save_records(records: List[Dict[str, Any]]):
    _write_json(RECORDS_FILE, records)


def load_settings() -> Dict[str, Any]:
    return _read_json(SETTINGS_FILE, {})


def save_settings(settings: Dict[str, Any]):
    _write_json(SETTINGS_FILE, settings)
