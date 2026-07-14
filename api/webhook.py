import asyncio
from fastapi import FastAPI, Request
from aiogram import Bot, Dispatcher, types
from aiogram.fsm.storage.memory import MemoryStorage

TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

app = FastAPI()

@dp.message()
async def echo_handler(message: types.Message):
    if message.text == "/start":
        await message.answer("Senga keyin aytaman! 😉")
    else:
        await message.reply("Hozir bandman, keyinroq gaplashamiz.")

@app.post("/api/webhook")
async def telegram_webhook(request: Request):
    try:
        json_data = await request.json()
        update = types.Update.model_validate(json_data, context={"bot": bot})
        await dp.feed_update(bot, update)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {"status": "Bot ishlayapti!"}

# Vercel serverless ishlashi uchun handler
async def handler(request):
    return {"status": "ASGI application handles requests"}