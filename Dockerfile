FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
