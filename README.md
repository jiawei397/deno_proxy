# deno_proxy

[![deno version](https://img.shields.io/badge/deno-^1.15.2-green?logo=deno)](https://github.com/denoland/deno)

Start a proxy server locally to cache Deno resources. The main reason is the
current deno land occasionally fails to download, and will consider publishing
and using private projects in the future.

## usage

You should use `import_map.json` like this:

```json
{
  "imports": {
    "https://deno.land/": "http://localhost:8080/https/deno.land/"
  }
}
```

Then you can run your server:

```
deno run --import-map ./import_map.json example.ts
```

See [here](https://deno.land/manual@v1.15.3/npm_nodejs/import_maps) for more
information.

## TODO

- [ ] publish private project by gitlab hooks
- [ ] manager private token
