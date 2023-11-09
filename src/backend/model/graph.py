from pydantic import BaseModel
from typing import List

class GraphBase(BaseModel):
    start: str
    end: str
    distance: int

class GraphList(BaseModel):
    data: List[GraphBase]
