// ✅ Initialize Telegram WebApp
Telegram.WebApp.ready();

// 🔐 Extract Telegram user info
export const userId = Telegram.WebApp.initDataUnsafe?.user?.id;
export const referralCode = `GLX${userId?.toString().slice(-6)}`;

// 💬 Global function to send commands to backend
export function sendTelegramCommand(commandText) {
  Telegram.WebApp.sendData(JSON.stringify({
    message: {
      text: commandText,
      chat: { id: userId }
    }
  }));
}

// 💰 Global function to fetch wallet balance
export async function fetchBalance() {
  try {
    const res = await fetch(`https://gamelootx-ui.pages.dev/functions/getBalance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    return data.balance;
  } catch (err) {
    console.error("Balance fetch failed:", err);
    return null;
  }
}
