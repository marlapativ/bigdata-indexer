FROM node:21-alpine3.18 AS base_build

WORKDIR /usr/src/app
COPY . .

FROM base_build AS build
RUN npm install
RUN npm run build
ENV NODE_ENV=production

FROM build AS webapp
WORKDIR /usr/src/app/dist
ENV PORT=8080
CMD ["npm", "start"]
EXPOSE 8080
EXPOSE 8081
EXPOSE 4000

FROM build AS consumer
WORKDIR /usr/src/app/dist
CMD ["npm", "run", "start:consumer"]
