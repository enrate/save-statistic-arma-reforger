const express = require('express');
const app = express();

// Middleware для разбора JSON
app.use(express.json());

// Конфигурация
const PORT = 3000;
const API_TOKEN = 'dkfSkell35jwlslSL'; // Замените на свой токен

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

// POST endpoint с проверкой токена
app.post('/data', authMiddleware, (req, res) => {
  console.log('Получены данные:', req.body);
  console.log(req.body.events)
  console.log(JSON.stringify(req.body))
  console.log(JSON.parse(req.body))
  switch(req.body.events.name) {
    case "serveradmintools_player_joined":
      console.log(req.body.events.data)
      console.log('Зашел плеер с неймом: ', req.body.events.data)
  }
  res.status(200).json({ message: 'Данные получены' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});