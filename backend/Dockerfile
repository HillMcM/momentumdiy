# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev=false

# Build
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=base /app/dist ./dist
## Do not bake secrets into the image. Use platform env vars instead.

EXPOSE 3001
CMD ["node", "dist/index.js"]

# Force rebuild with Stripe routes - $(date +%s)


