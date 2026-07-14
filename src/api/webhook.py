import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.fsm.storage.memory import MemoryStorage

TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# Botingiz buyruqlari
@dp.message()
async def echo_handler(message: types.Message):
    if message.text == "/start":
        await message.answer("Salom! Bot Vercel serverida muvaffaqiyatli ishga tushdi! 🎉")
    else:
        await message.reply(f"Siz yozdingiz: {message.text}")

# Vercel ushbu funksiyani avtomatik ishga tushiradi
async def handler(request):
    if request.method == "POST":
        json_string = await request.text()
        update = types.Update.model_validate_json(json_string)
        await dp.feed_update(bot, update)
    return types.Response(text="OK")