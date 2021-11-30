// Copyright 2020 Datafuse Labs.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

mod error;
mod handlers;

use crate::error::Error;
use crate::error::Result;
use crate::handlers::asset_handler;
use crate::handlers::index_handler;
use crate::handlers::proxy_handler;
use crate::handlers::HttpProxyOptions;
use clap::Parser;
use poem::get;
use poem::listener::TcpListener;
use poem::post;
use poem::EndpointExt;
use poem::Route;
use poem::Server;
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
    let app = Route::new()
        .at("/", get(index_handler))
        .at("/assets/:path", get(asset_handler))
        .at("/v1/*path", post(proxy_handler).get(proxy_handler))
        .data(proxy_options);

    let sock_addr: std::net::SocketAddr = opts
        .listen_addr
        .parse()
        .map_err(|_| Error::ArgumentError(format!("Bad listen addr: {}", opts.listen_addr)))?;
    tracing::info!("listening on {}", sock_addr);

    Server::new(TcpListener::bind(&sock_addr))
        .run(app)
        .await
        .map_err(|err| Error::ArgumentError(format!("Start serve failed, cause: {}", err)))?;

    Ok(())
}
