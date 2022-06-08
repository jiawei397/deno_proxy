# deno_proxy

[![deno version](https://img.shields.io/badge/deno-^1.20.6-blue?logo=deno)](https://github.com/denoland/deno)

Start a proxy server locally to cache Deno resources. The main reason is the
current deno land occasionally fails to download.

## start server

```
deno run --allow-net --allow-read --allow-write --allow-env https://deno.land/x/deno_proxy@v0.0.2/mod.ts
```

Then your server will be started on `http://localhost`. You can use like this:

```ts
import { VERSION } from "http://localhost/https/deno.land/std@0.140.0/version.ts";

console.log(VERSION);
```

It just changed your origin URL `https://deno.land` to
`http://localhost/https/deno.land`.

## use cli to generate import_map.json

If your `import_map.json` like this:

```json
{
  "imports": {
    "/std/": "https://deno.land/std@0.140.0/"
  }
}
```

Then generate your proxy `import_map.json` by the above:

```
deno run --allow-read --allow-write https://deno.land/x/deno_proxy@v0.0.3/cli/mod.ts --baseUrl http://localhost --oldPath example/import_map.json --newPath example/import_map_proxy.json
```

The `import_map_proxy.json` should be this:

```json
{
  "imports": {
    "/std/": "http://localhost:8000/https/deno.land/std@0.140.0/"
  }
}
```

Then you can run your code:

```
deno run -A --import-map ./example/import_map_proxy.json ./example/mod.ts
```

See [here](https://deno.land/manual@v1.15.3/npm_nodejs/import_maps) for more
information.
