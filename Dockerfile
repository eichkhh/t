FROM node:24-alpine AS development

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

FROM development AS build

ARG SERVICE_NAME

RUN npm run "build:docker:${SERVICE_NAME}"

RUN npm prune --omit=dev

FROM node:24-alpine AS production

ARG SERVICE_NAME

WORKDIR /usr/src/app

RUN addgroup -g 1001 -S nodeapp && adduser -S nodeapp -u 1001 -G nodeapp

COPY --chown=nodeapp:nodeapp scripts/docker-healthcheck.js /usr/src/app/scripts/docker-healthcheck.js

COPY --from=build --chown=nodeapp:nodeapp /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nodeapp:nodeapp /usr/src/app/dist/apps/${SERVICE_NAME} /usr/src/app/dist/apps/${SERVICE_NAME}

ENV NODE_ENV=production
ENV SERVICE_NAME=${SERVICE_NAME}

USER nodeapp

CMD ["sh", "-c", "node dist/apps/${SERVICE_NAME}/apps/${SERVICE_NAME}/src/main.js"]
