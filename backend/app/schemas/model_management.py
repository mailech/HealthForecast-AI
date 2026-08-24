from pydantic import BaseModel, ConfigDict


class ModelRegistryBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    model_name: str
    version: str
    accuracy: float | None = None
    is_active: bool = False


class ModelRegistryResponse(ModelRegistryBase):
    id: int

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())