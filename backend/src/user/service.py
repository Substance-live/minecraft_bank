from src.func.filter_by import filter_by
from src.user.repository import UserRepository
from src.user.schemas import UserSchema, UserUpdateSchema, UserFilterSchema, UserRegisterSchema, UserLoginSchema


class UserService:

    @classmethod
    def add(cls, new_user: UserRegisterSchema) -> UserSchema:
        value: dict = new_user.model_dump()
        db_user = UserRepository.add(value)
        return UserSchema.model_validate(db_user)

    @classmethod
    def find(cls, filter_data: UserFilterSchema | UserLoginSchema) -> UserSchema | None:
        value = filter_by(filter_data)
        db_user = UserRepository.find(value)

        if db_user is not None:
            return UserSchema.model_validate(db_user)

        return None

    @classmethod
    def all(cls) -> list[UserSchema]:
        return [UserSchema.model_validate(elem) for elem in UserRepository.all()]

    @classmethod
    def update(cls, update_data: UserUpdateSchema) -> int:
        value = filter_by(update_data)
        row_count = UserRepository.update(update_data.id, value)
        return row_count
