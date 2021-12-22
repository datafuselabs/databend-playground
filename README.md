# databend-playground

a simpl playground frontend ui for databend.

## Develop

please start databend by `make run-debug` first.

backend:

```
make build
target/debug/databend-playground --listen-addr 0.0.0.0:4000 --bend-http-api http://127.0.0.1:8001
```

frontend:

```
make ui-debug
```

## Contributing

You can learn more about contributing to the Datafuse project by reading our [Contribution Guide](https://databend.rs/dev/contributing/) and by viewing our [Code of Conduct](https://databend.rs/dev/policies/code-of-conduct).

## License

databend-playground is licensed under [Apache 2.0](LICENSE).
