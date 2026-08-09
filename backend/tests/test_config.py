from app.core.config import Settings


def test_allowed_origins_accepts_comma_separated_value() -> None:
    settings = Settings(
        _env_file=None,
        allowed_origins="http://localhost:3000, http://localhost:5173",
    )

    assert settings.allowed_origins == [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
