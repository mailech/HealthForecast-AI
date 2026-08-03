# pyrefly: ignore [missing-import]
from bson import ObjectId
# pyrefly: ignore [missing-import]
from pydantic import BeforeValidator, PlainSerializer
from typing import Annotated

# Custom ObjectId validation and serialization type for Pydantic V2
PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(lambda v: ObjectId(v) if isinstance(v, str) and ObjectId.is_valid(v) else v),
    PlainSerializer(lambda v: str(v), return_type=str),
]
