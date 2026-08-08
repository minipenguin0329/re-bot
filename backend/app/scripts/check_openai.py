import asyncio

from app.services.openai_service import get_openai_service


async def main() -> None:
    connected = await get_openai_service().check_connection()
    print("OpenAI connection: ok" if connected else "OpenAI connection: unexpected response")


if __name__ == "__main__":
    asyncio.run(main())

