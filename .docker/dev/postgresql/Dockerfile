FROM postgres:18.6-alpine3.24

ENV TZ=Europe/Kyiv

ARG UID
ARG GID
ARG UMASK
ARG USERNAME

RUN apk add --no-cache \
    ca-certificates tzdata shadow

RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
  && echo "${TZ}" > /etc/timezone

RUN groupmod --gid "${GID}" "${USERNAME}" \
  && usermod --uid "${UID}" --gid "${GID}" "${USERNAME}"

RUN mkdir -p /var/lib/postgresql/ /var/run/postgresql/ /var/log/postgresql/ \
  && chown -R ${UID}:${GID} /var/lib/postgresql/ /var/run/postgresql/ /var/log/postgresql/ \
  && chmod -R 755 /var/lib/postgresql/ /var/log/postgresql/ /var/run/postgresql/

#COPY --chown=${UID}:${GID} .docker/dev/postgresql/postgresql.conf /etc/postgresql/postgresql.conf
COPY --chown=${UID}:${GID} .docker/dev/postgresql/entrypoint.sh /usr/local/bin/custom-entrypoint.sh

RUN chmod +x /usr/local/bin/custom-entrypoint.sh

USER ${USERNAME}

WORKDIR /var/lib/postgresql

EXPOSE 5432

ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]

#CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
CMD ["postgres"]