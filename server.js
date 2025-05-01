require('dotenv/config');
const express = require('express');
const { Client, IntentsBitField } = require('discord.js');
const app = express();
const pool = require('./db');
const { processDisconnectedPlayer } = require('./afterDisconnect');
const { processConnectedPlayer } = require('./afterConnect');
const { processKillPlayer } = require('./afterKill');

// Middleware для разбора JSON
app.use(express.json());

// Конфигурация
const PORT = 3000;
const API_TOKEN = 'dkfSkell35jwlslSL';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_MAPPING = {
  "logger_player_connected": "1365101461788168202",
  "logger_player_killed": "1365155098052792360",
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
      console.log(eventData)

      // Определение канала по типу события
      let channelId;
      switch(actionName) {
        case 'logger_player_connected': {
          try{
          channelId = CHANNEL_MAPPING.logger_player_connected;
          await sendToDiscord(channelId, `🎮 Игрок присоединился: ${eventData.player} (ID: ${eventData.identity})`);
          } catch (err) {
            console.log(err)
          }
          try {
            await processConnectedPlayer(eventData.player, eventData.identity);
          } catch (err) {
            console.log(err)
          }
          break;
      }
      case 'logger_player_disconnected': {
        try{
          channelId = CHANNEL_MAPPING.logger_player_connected;
          await sendToDiscord(channelId, `🎮 Игрок отключился: ${eventData.player} (ID: ${eventData.identity})`);
        } catch (err) {
          console.log(err)
        }
        try{
          await processDisconnectedPlayer(eventData.identity, eventData.player);
        } catch (err) {
          console.log(err)
        }
        break;
    }

        case 'logger_player_killed': {
          try {
            channelId = CHANNEL_MAPPING.logger_player_killed;
            await sendToDiscord(channelId, `🔫 Игрок ${eventData.instigator} убил${eventData.friendly ? ' союзника' : '' } ${eventData.player}`);
          } catch (err) {
            console.log(err)
          }
          try {
            await processKillPlayer(eventData.instigator, eventData.player, eventData.friendly);
          } catch (err) {
            console.log(err)
          }
    break;
  }

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