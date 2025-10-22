# Stage 1
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm ci

COPY . .

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

RUN npm run build

# Stage 2

FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

# ARG NODE_ENV=development
# ENV NODE_ENV=${NODE_ENV}

CMD ["serve", "-s", "dist", "-l", "5173"]