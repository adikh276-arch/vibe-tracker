FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_NEON_API_KEY
ARG VITE_NEON_PROJECT_ID
ARG VITE_NEON_BRANCH_ID
ARG VITE_AUTH_API_URL

ENV VITE_NEON_API_KEY=$VITE_NEON_API_KEY
ENV VITE_NEON_PROJECT_ID=$VITE_NEON_PROJECT_ID
ENV VITE_NEON_BRANCH_ID=$VITE_NEON_BRANCH_ID
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL

RUN npm run build


FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist /usr/share/nginx/html/vibe_tracker

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
