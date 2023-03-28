FROM dk.uino.cn/library/denoland-deno:alpine-1.31.3

EXPOSE 80

WORKDIR /app

# Prefer not to run as root.
# RUN chown -R deno /app
# RUN chmod 755 /app

# USER deno

COPY . .

ENV DENO_DIR=deno-dir
RUN deno cache --unstable mod.ts

ENV BASE_URL=https://deno-mirror.uino.cn
ENV CACHE_DIR_DENO=cache/4

CMD deno run --allow-net --allow-env --allow-write --allow-read --unstable mod.ts