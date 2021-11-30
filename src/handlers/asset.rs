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

use include_dir::include_dir;
use include_dir::Dir;
use poem::handler;
use poem::http::header;
use poem::http::header::HeaderValue;
use poem::http::StatusCode;
use poem::web::Path;
use poem::IntoResponse;
use poem::Response;

const ASSETS_DIR: Dir = include_dir!("./ui/dist");

#[handler]
pub async fn asset_handler(Path(path): Path<String>) -> Response {
    serve_static_asset(format!("assets/{}", path))
}

#[handler]
pub async fn index_handler() -> impl IntoResponse {
    serve_static_asset(format!("index.html"))
}

fn serve_static_asset(path: String) -> Response {
    let file = match ASSETS_DIR.get_file(&path) {
        None => return (StatusCode::NOT_FOUND, "Not found").into_response(),
        Some(file) => file,
    };

    let buffer: Vec<u8> = file.contents().iter().map(|c| *c).collect();
    let content_type = HeaderValue::from_str(if path.ends_with(".js") {
        "application/javascript"
    } else if path.ends_with(".css") {
        "text/css"
    } else {
        "text/html; charset=utf8"
    })
    .unwrap();
    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, content_type)
        .body(buffer)
}
