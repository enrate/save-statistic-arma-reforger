require('dotenv/config');
const express = require('express');
const { Client, IntentsBitField } = require('discord.js');
const app = express();

// Middleware для разбора JSON
app.use(express.json());

// Конфигурация
const PORT = 3000;
const API_TOKEN = 'dkfSkell35jwlslSL';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_MAPPING = {
  "serveradmintools_player_joined": "1365101461788168202",
  "serveradmintools_player_left": "DISCORD_CHANNEL_ID_FOR_LEAVES",
  "admin_notification": "DISCORD_CHANNEL_ID_FOR_ADMIN"
};

// Инициализация Discord клиента
const discordClient = new Client({ 
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages] 
});

// Middleware проверки токена
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = authHeader.split(' ')[1];
  
  if (token !== API_TOKEN) {
    return res.status(403).json({ error: 'Неверный токен' });
  }

  next();
};

// Функция для отправки сообщений в Discord
async function sendToDiscord(channelId, message) {
  try {
    const channel = await discordClient.channels.fetch(channelId);
    if (channel && channel.isTextBased()) {
      await channel.send(message);
    }
  } catch (error) {
    console.error('Ошибка отправки в Discord:', error);
  }
}

// Обработка входящих вебхуков
app.post('/data', authMiddleware, async (req, res) => {
  console.log('Получены данные:', req.body);
  
  try {
    const events = req.body.events || [];
    for (const event of events) {
      const actionName = event.name;
      const eventData = event.data;

      // Определение канала по типу события
      let channelId;
      switch(actionName) {
        case 'serveradmintools_player_joined':
          channelId = CHANNEL_MAPPING.serveradmintools_player_joined;
          await sendToDiscord(channelId, `🎮 Игрок присоединился: ${eventData.player} (ID: ${eventData.identity})`);
          break;

        case 'serveradmintools_player_left':
          channelId = CHANNEL_MAPPING.serveradmintools_player_left;
          await sendToDiscord(channelId, `🚪 Игрок вышел: ${eventData.player} (Причина: ${eventData.reason})`);
          break;

        case 'admin_notification':
          channelId = CHANNEL_MAPPING.admin_notification;
          await sendToDiscord(channelId, `⚠️ Админ-уведомление: ${eventData.message}`);
          break;

        default:
          console.log('Неизвестное событие:', actionName);
      }
    }

    res.status(200).json({ message: 'Данные получены и обработаны' });
  } catch (error) {
    console.error('Ошибка обработки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Запуск сервера и Discord бота
discordClient.login(DISCORD_BOT_TOKEN).then(() => {
  console.log('Discord бот авторизован');
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
});