# Dockerfile (frontend)
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .

# Increase memory limit to 4 GB
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80

 