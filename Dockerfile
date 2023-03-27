FROM dk.uino.cn/library/denoland-deno:alpine-1.30.1

EXPOSE 80

WORKDIR /app

# Prefer not to run as root.
RUN chown -R deno /app
RUN chmod 755 /app

USER deno

COPY . .

# ENV DENO_DIR=deno-dir
ENV BASE_URL=https://deno-mirror.uino.cn
ENV CACHE_DIR_DENO=cache/3

RUN deno cache --unstable mod.ts

CMD deno run --allow-net --allow-env --allow-write --allow-read --unstable mod.ts