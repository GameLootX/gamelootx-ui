async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"Received: {update.message.text}")
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

import logging
from apscheduler import util
import pytz
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from collections import defaultdict

# 🔧 Timezone fix
util.get_localzone = lambda: pytz.timezone("Asia/Kolkata")

# 🔒 Credentials
BOT_TOKEN = "8451731848:AAH9QzDbCdUq5PoQtmwyLucmSlkMpSjEBJM"
ADMIN_ID = 5778437193

# 🧠 In-memory DB
user_balances = defaultdict(float)
referral_claimed = set()

# 🟢 /start with referral bonus = $0.10
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    args = context.args

    if args and uid not in referral_claimed:
        referrer_id = int(args[0])
        if referrer_id != uid:
            user_balances[referrer_id] += 0.10
            referral_claimed.add(uid)
            await context.bot.send_message(chat_id=referrer_id, text=f"🎉 You earned $0.10 USDT for referring {uid}!")

    await update.message.reply_text("🎮 Welcome to GameLootX!")
    try:
        await context.bot.send_message(chat_id=ADMIN_ID, text=f"User {uid} started the bot.")
    except Exception as e:
        logging.warning(f"Admin notify failed: {e}")

# 💰 /deposit <amount> — min $10
async def deposit(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    args = context.args

    if not args or not args[0].replace('.', '', 1).isdigit():
        await update.message.reply_text("❌ Please specify deposit amount. Example: /deposit 10")
        return

    amount = float(args[0])
    if amount < 10.0:
        await update.message.reply_text("⚠️ Minimum deposit is $10 USDT.")
        return

    user_balances[uid] += amount
    await update.message.reply_text(f"✅ ${amount:.2f} USDT deposited to your GameLootX balance.")

# 🔗 /refer
async def refer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    link = f"https://t.me/GameLootXBot?start={uid}"
    await update.message.reply_text(f"🔗 Your referral link:\n{link}")

# 🧾 /withdraw — min $10
async def withdraw(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = update.effective_user.id
    balance = user_balances[uid]
    if balance >= 10.0:
        user_balances[uid] -= 10.0
        await update.message.reply_text("💸 $10 USDT withdrawn successfully.")
    else:
        await update.message.reply_text(f"⚠️ Insufficient balance. You have ${balance:.2f} USDT.")

# 🏆 /leaderboard
async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    top = sorted(user_balances.items(), key=lambda x: x[1], reverse=True)[:3]
    msg = "🏆 Top Players:\n"
    for i, (uid, bal) in enumerate(top, 1):
        msg += f"{i}. User {uid} — ${bal:.2f} USDT\n"
    await update.message.reply_text(msg)

# 🪙 /crypto
async def crypto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🪙 USDT Deposit Address:\n`TRX7xk9v...gamelootxUSDT`")

# 🚀 Main runner
def main():
    logging.basicConfig(level=logging.INFO)
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("deposit", deposit))
    app.add_handler(CommandHandler("refer", refer))
    app.add_handler(CommandHandler("withdraw", withdraw))
    app.add_handler(CommandHandler("leaderboard", leaderboard))
    app.add_handler(CommandHandler("crypto", crypto))

    app.run_polling()

if __name__ == "__main__":
    main()
