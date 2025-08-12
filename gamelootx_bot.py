import telebot
import requests
import random
from datetime import datetime

BOT_TOKEN = "8451731848:AAH9QzDbCdUq5PoQtmwyLucmSlkMpSjEBJM"
API_KEY = "C3W1DDF-C4GMSZC-HQPJC7M-MJWWSNQ"
WEBHOOK_URL = "https://gamelootx.fastrapids.com/webapp"
ADMIN_ID = 5778437193

bot = telebot.TeleBot(BOT_TOKEN)
users = {}
referrals = {}
leaderboard = {}

def update_leaderboard(user_id, amount):
    leaderboard[user_id] = leaderboard.get(user_id, 0) + amount

def process_referral(user_id, ref_code):
    if ref_code and ref_code != str(user_id):
        referrals[ref_code] = referrals.get(ref_code, 0) + 1
        users[user_id]['balance'] += 10  # Bonus for referred user
        users[int(ref_code)]['balance'] += 10  # Bonus for referrer

def create_invoice(user_id, amount):
    payload = {
        "price_amount": amount,
        "price_currency": "USD",
        "pay_currency": "USDTTRC20",
        "ipn_callback_url": WEBHOOK_URL,
        "order_id": f"GLX-{user_id}-{datetime.now().timestamp()}",
        "buyer_email": f"user{user_id}@gamelootx.com",
        "token": API_KEY
    }
    res = requests.post("https://api.nowpayments.io/v1/invoice", json=payload)
    return res.json().get("invoice_url", "Error creating invoice")

@bot.message_handler(commands=['start'])
def start(msg):
    uid = msg.from_user.id
    ref = msg.text.split()[1] if len(msg.text.split()) > 1 else None
    if uid not in users:
        users[uid] = {"balance": 0}
        process_referral(uid, ref)
    bot.send_message(uid, f"Welcome to GameLootX!\nBalance: ${users[uid]['balance']}")

@bot.message_handler(commands=['deposit'])
def deposit(msg):
    uid = msg.from_user.id
    invoice = create_invoice(uid, 5)
    bot.send_message(uid, f"Pay using this link:\n{invoice}")

@bot.message_handler(commands=['play'])
def play(msg):
    uid = msg.from_user.id
    color = msg.text.split()[1].lower() if len(msg.text.split()) > 1 else None
    if color not in ['red', 'green']:
        bot.send_message(uid, "Choose 'red' or 'green'")
        return
    if users[uid]['balance'] < 5:
        bot.send_message(uid, "Insufficient balance")
        return
    users[uid]['balance'] -= 5
    result = random.choice(['red', 'green'])
    if color == result:
        users[uid]['balance'] += 10
        update_leaderboard(uid, 10)
        bot.send_message(uid, f"You won! Color was {result}. New balance: ${users[uid]['balance']}")
    else:
        bot.send_message(uid, f"You lost! Color was {result}. New balance: ${users[uid]['balance']}")

@bot.message_handler(commands=['leaderboard'])
def show_leaderboard(msg):
    sorted_lb = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
    text = "🏆 Leaderboard:\n"
    for i, (uid, score) in enumerate(sorted_lb[:10], 1):
        text += f"{i}. User {uid}: ${score}\n"
    bot.send_message(msg.chat.id, text)

@bot.message_handler(commands=['balance'])
def balance(msg):
    uid = msg.from_user.id
    bal = users.get(uid, {}).get('balance', 0)
    bot.send_message(uid, f"Your balance: ${bal}")

bot.send_message(ADMIN_ID, "GameLootX bot is now live.")
bot.polling()
