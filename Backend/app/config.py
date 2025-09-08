from pydantic_settings import BaseSettings


class Settings(BaseSettings):
	# Example: mysql+pymysql://root:password@127.0.0.1:3306/bayanihan_exchange
	DATABASE_URL: str = "mysql+pymysql://root:@127.0.0.1:3306/bayanihan_exchange"
	CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

	class Config:
		env_file = ".env"


settings = Settings()



