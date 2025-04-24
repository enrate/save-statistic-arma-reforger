# Используем официальный образ Node.js
FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY .env /app/.env

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]