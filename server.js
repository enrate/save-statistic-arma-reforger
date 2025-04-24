const express = require('express');
const app = express();

// Middleware для разбора JSON
app.use(express.json());

// POST endpoint
app.post('/data', (req, res) => {
  console.log('Получены данные:', req.body);
  res.status(200).json({ message: 'Данные получены' });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});