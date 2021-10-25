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
use std::sync::Arc;
use tokio;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let proxy_options = Arc::new(HttpProxyOptions {
        base_api: "http://localhost:8001".to_string(),
    });
    let app = Router::new()
        .route("/v1/statement", post(proxy_handler))
        .route("/", get(index_handler))
        .route("/assets/:path", get(asset_handler))
        .layer(AddExtensionLayer::new(proxy_options))
        .boxed();

    let addr = "0.0.0.0:4000";
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
