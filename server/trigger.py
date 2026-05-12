import asyncio
from app.core.database import connect_database
from app.services.pdf_service import process_pdf_service

async def run():
    await connect_database()
    r = await process_pdf_service("6a031e79b17cf250bafe46bf", "6a031e63b17cf250bafe46be", "free")
    print(r)

asyncio.run(run())
