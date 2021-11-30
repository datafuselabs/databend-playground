build: ui
	cargo build

ui:
	cd ui && yarn install && npm run build

ui-debug:
	cd ui && yarn install && npm run dev

.PHONY: ui ui-debug build
