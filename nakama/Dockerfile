FROM node:18-alpine AS builder

WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM heroiclabs/nakama:3.21.1

COPY --from=builder /backend/data/modules/tictactoe.js /nakama/data/modules/tictactoe.js

EXPOSE 7350

ENTRYPOINT ["/bin/sh", "-c", "/nakama/nakama migrate up --database.address $DB_URL && exec /nakama/nakama --database.address $DB_URL --socket.port ${PORT:-7350} --logger.level DEBUG --runtime.js_entrypoint tictactoe.js"]