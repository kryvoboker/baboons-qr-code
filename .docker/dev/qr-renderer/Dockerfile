# syntax=docker/dockerfile:1

FROM node:25.6.1-slim

ARG UID=1000
ARG GID=1000
ARG UMASK=0002

ENV TZ=Europe/Kyiv \
    HOME=/home/node \
    NPM_CONFIG_CACHE=/home/node/.npm

RUN set -eux; \
    if getent group node > /dev/null; then \
        groupmod -o -g "${GID}" node; \
    else \
        groupadd -o -g "${GID}" node; \
    fi; \
    usermod -o -u "${UID}" -g "${GID}" -d "${HOME}" node; \
    mkdir -p "${HOME}"; \
    chown -R "${UID}:${GID}" "${HOME}"

WORKDIR /var/www/html

COPY httpdocs/qr-renderer/package*.json ./

RUN npm ci --omit=optional \
    && chown -R "${UID}:${GID}" /var/www/html /home/node

COPY --chown=${UID}:${GID} .docker/dev/qr-renderer/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

COPY --chown=${UID}:${GID} httpdocs/qr-renderer/src ./src
COPY --chown=${UID}:${GID} httpdocs/qr-renderer/tsconfig.json httpdocs/qr-renderer/biome.json ./

USER node

EXPOSE 3100

RUN npm ci

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]