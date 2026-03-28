FROM node:18-alpine AS builder

WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM heroiclabs/nakama:3.21.1

WORKDIR /nakama/data/modules

COPY --from=builder /backend/data/modules/tictactoe.js .
