from pydantic import BaseModel

class DocumentCreate(BaseModel):
    title: str
    language: str

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int

    class Config:
        from_attributes = True  