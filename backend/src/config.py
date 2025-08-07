from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path("/db")

class Settings(BaseSettings):
    DB_NAME: str = "DefaultValue"
    DB_ENGINE: str = "DefaultValue"

    MODE: str = "DefaultValue"

    @property
    def DB_URL(self) -> str:
        return f"{self.DB_ENGINE}:///{BASE_DIR}/{self.DB_NAME}.db"


    model_config =  SettingsConfigDict(env_file=BASE_DIR / ".env")

settings = Settings()

if __name__ == '__main__':
    settings = Settings()
    print(settings, "DB_URL=" + settings.DB_URL)