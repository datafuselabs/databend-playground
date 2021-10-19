build: ui
	cargo build

ui:
	cd ui && npm run build

.PHONY: ui build
