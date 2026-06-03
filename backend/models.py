from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class RecordBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = Field(default="event", description="event|alert|stat")
    severity: str = Field(default="normal", description="low|normal|high|critical")
    is_live: bool = False


class RecordCreate(RecordBase):
    pass


class RecordUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    is_live: Optional[bool] = None


class Record(RecordBase):
    id: str
    created_at: datetime

    @staticmethod
    def new_from_create(data: RecordCreate) -> "Record":
        return Record(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            **data.dict(),
        )


class UserSettings(BaseModel):
    theme: str = "dark"
    notifications_enabled: bool = True
    compact_mode: bool = False
