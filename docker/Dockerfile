FROM node:22-alpine

WORKDIR /app

COPY ./projet/package.json .

RUN npm install

COPY ./projet .

EXPOSE 3000

ENV ADDRESS=0.0.0.0 PORT=3000

CMD ["npm", "start"]


# FROM nginx:1.27-alpine

# WORKDIR /root/

# COPY ./docker/nginx.conf /etc/nginx/nginx.conf
# COPY --from=builder-front /app/dist /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
