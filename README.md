# databend-playground

## Develop

please start databend by ``

backend:

```
make build
target/debug/databend-playground --listen-addr 0.0.0.0:4000 --bend-http-api http://127.0.0.1:8001
```

frontend:

```
make ui-debug
```
