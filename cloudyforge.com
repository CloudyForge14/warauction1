server {
    listen 80;
    server_name cloudyforge.com www.cloudyforge.com;

    # Редирект HTTP на HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name cloudyforge.com www.cloudyforge.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/cloudyforge.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cloudyforge.com/privkey.pem;

    # Отключение кеширования для /auction
    location /auction {
        proxy_pass http://145.223.102.44:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Отключение кеширования
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        expires off;
    }

    # Отключение кеширования для /admin
    location /admin {
        proxy_pass http://145.223.102.44:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Отключение кеширования
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        expires off;
    }

    # Включение кеширования для всех остальных запросов
    location / {
        proxy_pass http://145.223.102.44:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Включение кеширования
        add_header Cache-Control "public, max-age=3600";
    }
}

