FROM denoland/deno:alpine-1.20.6

EXPOSE 80

WORKDIR /app

# Prefer not to run as root.
RUN chown -R deno /app
RUN chmod 755 /app

ADD . .

ENV DENO_DIR=deno-dir

RUN deno cache --unstable mod.ts

CMD deno run --allow-net --allow-env --allow-write --allow-read --unstable mod.ts