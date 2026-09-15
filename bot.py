import os
import json
import urllib.parse
import urllib.request

TOKEN = os.environ["BOT_TOKEN"]
MINI_APP_URL = "https://mehmedjanbeno-web.github.io/Akidatan-Academy/?v=20260915-final"

WELCOME_TEXT = """🕌 Ассаламу Ӏалайкум ва рахьматуллахӀи ва баракатухӀ!

📚 Марша догӀийла «Ӏакъидатан Академие».

Кхузахь шун аьтто хир бу Академин курсаш Ӏамо, аудиоурокашка ладогӀа, материалаш еша, PDF-файлаш схьаелла, оьшуш йолу урокаш Ӏалашъян а, шайн кхиамашка (прогрессе) ладогӀа а.

🎓 Дешар доло «Академи схьаелла» тӀе таӀае."""


def api(method, data=None):
    encoded = urllib.parse.urlencode(data or {}).encode("utf-8")
    with urllib.request.urlopen(f"https://api.telegram.org/bot{TOKEN}/{method}", data=encoded, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def send_welcome(chat_id):
    keyboard = {
        "inline_keyboard": [[
            {"text": "📚 Академи схьаелла", "web_app": {"url": MINI_APP_URL}}
        ]]
    }
    api("sendMessage", {
        "chat_id": chat_id,
        "text": WELCOME_TEXT,
        "reply_markup": json.dumps(keyboard, ensure_ascii=False),
    })


def send_contact_prompt(chat_id):
    api("sendMessage", {
        "chat_id": chat_id,
        "text": "✉️ Связь с администратором\n\nНапишите ваше сообщение следующим сообщением. Администратор получит его в этом боте.",
    })


def main():
    offset = 0
    print("Akidatan Academy bot started")
    while True:
        try:
            result = api("getUpdates", {"timeout": 50, "offset": offset})
            for update in result.get("result", []):
                offset = update["update_id"] + 1
                message = update.get("message") or {}
                text = message.get("text", "")
                chat = message.get("chat") or {}
                parts = text.split()
                command = parts[0].split("@")[0] if parts else ""

                if command == "/start" and chat.get("id"):
                    start_param = parts[1] if len(parts) > 1 else ""
                    if start_param == "contact_admin":
                        send_contact_prompt(chat["id"])
                    else:
                        send_welcome(chat["id"])
        except Exception as exc:
            print("Bot error:", exc)


if __name__ == "__main__":
    main()
