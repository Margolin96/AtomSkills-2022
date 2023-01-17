FROM node:16 as build-stage

ARG SERVICES
ENV VUE_APP_SERVICES=$SERVICES

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY .nginx.conf /etc/nginx/nginx.conf

CMD echo resolver $(awk 'BEGIN{ORS=" "} $1=="nameserver" {print $2}' /etc/resolv.conf) ipv6=off ";" > /etc/nginx/resolvers.conf; nginx
