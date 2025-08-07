from pydantic import BaseModel


def filter_by(filter_data: BaseModel) -> dict:
    return {key: value for key, value in filter_data.model_dump().items() if value is not None}
