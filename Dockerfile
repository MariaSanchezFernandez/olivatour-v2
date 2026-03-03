FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libpng-dev libxml2-dev libzip-dev libonig-dev unzip curl \
    && docker-php-ext-install pdo pdo_mysql mbstring xml zip gd \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --optimize-autoloader \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080
CMD ["sh", "-c", "php artisan migrate --force || echo 'Migration failed, continuing...' && php artisan optimize:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
