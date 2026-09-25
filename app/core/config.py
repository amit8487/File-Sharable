from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
from pathlib import Path 
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    #Storage Path
    storage_path: Path = Path("upload")

    #File size Limit
    max_file_size_mb:int = 100
    max_total_file_size_mb:int = 100

    @computed_field
    @property
    def max_file_size_bytes(self)->int:
        return self.max_file_size_mb*1024*1024
    
    @computed_field
    @property
    def max_total_file_size_bytes(self)->int:
        return self.max_total_file_size_mb*1024*1024
    
    #File Expiry (in days)
    default_expiry_days:int = 2
    max_guest_exiry_days:int = 5

    #file download Limit
    default_download_limit:int = 5
    max_guest_download_limit:int = 5

    #Database URL
    database_url:str = "sqlite+aiosqlite:///database.db"

@lru_cache
def get_settings() -> Settings:
    return Settings()