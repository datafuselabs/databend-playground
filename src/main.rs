mod error;
mod handlers;

use crate::handlers::asset_handler;
use crate::handlers::index_handler;
use crate::handlers::proxy_handler;
use crate::handlers::HttpProxyOptions;
use axum::handler::get;
use axum::handler::post;
use axum::AddExtensionLayer;
use axum::Router;
use tokio;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    let proxy_options = HttpProxyOptions {
        base_api: "http://localhost:8001",
    };
    let app = Router::new()
        .route("/v1/statement", post(proxy_handler))
        .layer(AddExtensionLayer::new(proxy_options))
        .route("/", get(index_handler))
        .route("/assets/:path", get(asset_handler));

    let addr = "0.0.0.0:4000";
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
