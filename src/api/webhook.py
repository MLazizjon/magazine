import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.fsm.storage.memory import MemoryStorage

TOKEN = "8640815581:AAH6bOE98p9F0vHLNukp_R3G69y2xWAUOto"

bot = Bot(token=TOKEN)
dp = Dispatcher(storage=MemoryStorage())

# Foydalanuvchi botga kirib /start bossa, shu funksiya ishlaydi
@dp.message()
async def echo_handler(message: types.Message):
    if message.text == "/start":
        # Bu yerga o'zingiz xohlagan istalgan matnni yozishingiz mumkin
        await message.answer("Senga keyin aytaman! 😉")
    else:
        # Agar startdan boshqa narsa yozsa:
        await message.reply("Hozir bandman, keyinroq gaplashamiz.")

# Vercel uchun maxsus qism
async def handler(request):
    if request.method == "POST":
        json_string = await request.text()
        update = types.Update.model_validate_json(json_string)
        await dp.feed_update(bot, update)
    return types.Response(text="OK")