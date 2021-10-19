use axum::body::Bytes;
use axum::body::Full;
use axum::extract;
use axum::http::Response;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use include_dir::include_dir;
use include_dir::Dir;
use std::convert::Infallible;

const ASSETS_DIR: Dir = include_dir!("./ui/dist");

pub struct AssetResponse {
    content: Option<Vec<u8>>,
}

impl IntoResponse for AssetResponse {
    type Body = Full<Bytes>;
    type BodyError = Infallible;

    fn into_response(self) -> Response<Self::Body> {
        match self.content {
            None => Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Full::from(format!("404 NOT FOUND")))
                .unwrap(),
            Some(content) => Response::builder()
                .status(StatusCode::OK)
                .body(Full::from(content))
                .unwrap(),
        }
    }
}

pub async fn asset_handler(extract::Path(path): extract::Path<String>) -> impl IntoResponse {
    match ASSETS_DIR.get_file(path) {
        None => AssetResponse { content: None },
        Some(file) => {
            let buffer = file.contents().iter().map(|c| *c).collect();
            AssetResponse {
                content: Some(buffer),
            }
        }
    }
}

pub async fn index_handler() -> impl IntoResponse {
    match ASSETS_DIR.get_file("index.html") {
        None => AssetResponse { content: None },
        Some(file) => {
            let buffer = file.contents().iter().map(|c| *c).collect();
            AssetResponse {
                content: Some(buffer),
            }
        }
    }
}
