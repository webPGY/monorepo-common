# ============================================================
# 多阶段构建: 支持通过 ARG 选择打包环境和目标项目
#
# 用法:
#   docker build --build-arg BUILD_TARGET=web --build-arg NODE_ENV=production -t openclaw-web .
#   docker build --build-arg BUILD_TARGET=admin --build-arg NODE_ENV=production -t openclaw-admin .
#   docker build --build-arg BUILD_TARGET=all --build-arg NODE_ENV=production -t openclaw-all .
#
# Jenkins 示例:
#   docker build \
#     --build-arg BUILD_TARGET=${BUILD_TARGET} \
#     --build-arg NODE_ENV=${NODE_ENV} \
#     -t openclaw-${BUILD_TARGET}:${BUILD_NUMBER} .
# ============================================================

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

ARG NODE_ENV=production
ARG BUILD_TARGET=all

ENV NODE_ENV=${NODE_ENV}
ENV BUILD_TARGET=${BUILD_TARGET}

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml ./
COPY .env.development .env.production ./
COPY packages/web/package.json packages/web/package.json
COPY packages/admin/package.json packages/admin/package.json

RUN pnpm install

COPY . .

RUN node scripts/build-selector.js

# ---------- Stage 2: Serve ----------
FROM nginx:stable-alpine AS production

ARG BUILD_TARGET=all

COPY docker/nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/dist/ /tmp/dist/

RUN if [ -d /tmp/dist/web ]; then \
      cp -r /tmp/dist/web /usr/share/nginx/html/web; \
    fi && \
    if [ -d /tmp/dist/admin ]; then \
      cp -r /tmp/dist/admin /usr/share/nginx/html/admin; \
    fi && \
    rm -rf /tmp/dist

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
