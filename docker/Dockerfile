FROM --platform=linux/x86-64 nginx:stable-alpine

WORKDIR /usr/src/app

COPY ./front /usr/share/nginx/html
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
