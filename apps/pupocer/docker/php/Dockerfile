FROM php:8.4-fpm

RUN apt-get update && apt-get install -y zlib1g-dev g++ git libicu-dev zip libzip-dev zip cron \
    && docker-php-ext-install intl opcache pdo pdo_mysql \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip

COPY docker/php/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-custom.ini
COPY docker/php/crontab /etc/cron.d/symfony-cleaner
RUN chmod 0644 /etc/cron.d/symfony-cleaner && crontab /etc/cron.d/symfony-cleaner

WORKDIR /app-build

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY composer.json composer.lock ./

RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

COPY . /app-build/

WORKDIR /app-build
RUN composer run-script post-install-cmd --no-interaction || true

WORKDIR /var/www/project
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]