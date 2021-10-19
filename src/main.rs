mod handlers;

use crate::handlers::asset_handler;
use crate::handlers::index_handler;
use crate::handlers::query_handler;
use axum::handler::get;
use axum::handler::post;
use axum::Router;
use tokio;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/queries", post(query_handler))
        .route("/", get(index_handler))
        .route("/assets/:path", get(asset_handler));

    let addr = "0.0.0.0:4000";
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr.parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
