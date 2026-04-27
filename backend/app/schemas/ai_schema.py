from pydantic import BaseModel

class SuggestRequest(BaseModel):
    code: str

    class Config:
        json_schema_extra = {
            "example": {
                "code": "def hello_world():\n    "
            }
        }