build: ui
	cargo build

ui:
	cd ui && npm install && npm run build

ui-debug:
	cd ui && npm install && npm run dev

.PHONY: ui ui-debug build
