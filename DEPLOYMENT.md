# Knife Shop - Deployment Guide

## 🐳 Docker Deployment на VPS

### Требования
- Docker и Docker Compose установлены на VPS
- Открыт порт 3000 (или настроен nginx reverse proxy)

### Быстрый старт

1. **Клонировать репозиторий на VPS:**
```bash
git clone https://github.com/ilyayarovoy/knife-shop-design.git
cd knife-shop-design
```

2. **Запустить через Docker Compose:**
```bash
docker-compose up -d
```

Приложение будет доступно на `http://your-vps-ip:8002`

### Альтернатива: Ручная сборка

```bash
# Собрать образ
docker build -t knife-shop .

# Запустить контейнер
docker run -d -p 3000:3000 --name knife-shop knife-shop
```

### Обновление приложения

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Nginx Reverse Proxy (опционально)

Создайте `/etc/nginx/sites-available/knife-shop`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфиг:
```bash
sudo ln -s /etc/nginx/sites-available/knife-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Мониторинг

```bash
# Логи контейнера
docker-compose logs -f

# Статус
docker-compose ps

# Перезапуск
docker-compose restart
```

## 🔧 Технические детали

- **Base Image:** Node.js 20 Alpine (минимальный размер)
- **Multi-stage build:** Оптимизация размера образа
- **Standalone output:** Next.js создаёт автономный сервер
- **Health checks:** Автоматическая проверка работоспособности
- **Port:** 3000 (configurable)

## 🌐 API Backend

Приложение использует API: `http://78.17.161.20:8001/`

Для изменения API URL установите переменную окружения `NEXT_PUBLIC_API_BASE` в `.env.local`
