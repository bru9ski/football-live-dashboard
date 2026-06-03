from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import Record, RecordCreate, RecordUpdate, UserSettings
from storage import load_records, save_records, load_settings, save_settings

app = FastAPI(title="Football Live Dashboard API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/records", response_model=List[Record])
def list_records():
    raw = load_records()
    return [Record(**r) for r in raw]


@app.post("/api/records", response_model=Record)
def create_record(payload: RecordCreate):
    records = load_records()
    record = Record.new_from_create(payload)
    records.append(record.dict())
    save_records(records)
    return record


@app.put("/api/records/{record_id}", response_model=Record)
def update_record(record_id: str, payload: RecordUpdate):
    records = load_records()
    for idx, r in enumerate(records):
        if r["id"] == record_id:
            updated = {**r, **{k: v for k, v in payload.dict().items() if v is not None}}
            records[idx] = updated
            save_records(records)
            return Record(**updated)
    raise HTTPException(status_code=404, detail="Record not found")


@app.delete("/api/records/{record_id}")
def delete_record(record_id: str):
    records = load_records()
    new_records = [r for r in records if r["id"] != record_id]
    if len(new_records) == len(records):
        raise HTTPException(status_code=404, detail="Record not found")
    save_records(new_records)
    return {"status": "deleted", "id": record_id}


@app.get("/api/settings", response_model=UserSettings)
def get_settings():
    raw = load_settings()
    if not raw:
        default = UserSettings()
        save_settings(default.dict())
        return default
    return UserSettings(**raw)


@app.put("/api/settings", response_model=UserSettings)
def update_settings(payload: UserSettings):
    save_settings(payload.dict())
    return payload
