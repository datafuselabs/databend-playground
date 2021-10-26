mod error;
mod handlers;

use crate::error::Error;
use crate::error::Result;
use crate::handlers::asset_handler;
use crate::handlers::index_handler;
use crate::handlers::proxy_handler;
use crate::handlers::HttpProxyOptions;
use axum::handler::get;
use axum::handler::post;
use axum::AddExtensionLayer;
use axum::Router;
use clap::Parser;
use tokio;
use tracing_subscriber;

#[derive(clap::Parser)]
#[clap(version = "1.0")]
struct Opts {
    #[clap(short, long)]
    listen_addr: String,
    #[clap(short, long)]
    bend_http_api: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    let opts: Opts = Opts::parse();

    let proxy_options = HttpProxyOptions {
        base_api: opts.bend_http_api.clone(),
    };
    let app = Router::new()
        .route("/v1/statement", post(proxy_handler))
        .layer(AddExtensionLayer::new(proxy_options))
        .route("/", get(index_handler))
        .route("/assets/:path", get(asset_handler));

    let sock_addr: std::net::SocketAddr = opts
        .listen_addr
        .parse()
        .map_err(|_| Error::ArgumentError(format!("Bad listen addr: {}", opts.listen_addr)))?;
    tracing::info!("listening on {}", sock_addr);

    axum::Server::bind(&sock_addr)
        .serve(app.into_make_service())
        .await
        .map_err(|err| Error::ArgumentError(format!("Start serve failed, cause: {}", err)))?;

    Ok(())
}
