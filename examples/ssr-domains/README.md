Running the example locally:

1. Override local DNS to point to localhost

Add the following lines to `/etc/hosts`:

```
127.0.0.1 example.com
127.0.0.1 example.fr
127.0.0.1 example.tw
```

2. Build the project

```
npm run build
```

3. Run the server

```
PORT=80 HOST=0.0.0.0 node ./dist/server/entry.mjs
```
