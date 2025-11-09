FROM node:24-alpine

# set working directory
WORKDIR /app

# copy package manifests and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# copy source
COPY . .

# allow Angular dev server to be reachable from host
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 4200

# start the Angular dev server on 0.0.0.0 so it is reachable from host
CMD ["sh", "-c", "npm start -- --host 0.0.0.0 --poll=2000"]
