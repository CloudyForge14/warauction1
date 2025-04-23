#!/bin/bash

# Останавливаем все процессы PM2 и удаляем их
echo "Останавливаем PM2..."
pm2 kill

# Получаем последние изменения из репозитория
echo "Выполняем git pull..."
git pull

# Собираем проект
echo "Собираем проект (npm run build)..."
npm run build

# Запускаем проект через PM2
echo "Запускаем проект через PM2..."
pm2 start npm --name "nextjs" -- start

# Выводим список процессов PM2
echo "Текущие процессы PM2:"
pm2 list