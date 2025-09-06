
# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./
RUN npm ci

COPY . ./
RUN npm run build

# ---------- Run ----------
FROM caddy:alpine AS runner

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY --from=build /app /app
COPY --from=build /app/Caddyfile /etc/caddy/Caddyfile

ENV NODE_ENV=production
EXPOSE 3000
EXPOSE 3001

CMD ["sh", "-c", "npm run start -- --port 3001 & caddy run --config /etc/caddy/Caddyfile"]