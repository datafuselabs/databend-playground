use axum::body::Bytes;
use axum::body::Full;
use axum::extract;
use axum::http::header;
use axum::http::header::HeaderValue;
use axum::http::Response;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use include_dir::include_dir;
use include_dir::Dir;

const ASSETS_DIR: Dir = include_dir!("./ui/dist");

pub async fn asset_handler(extract::Path(path): extract::Path<String>) -> impl IntoResponse {
    serve_static_asset(format!("assets/{}", path))
}

pub async fn index_handler() -> impl IntoResponse {
    serve_static_asset(format!("index.html"))
}

fn serve_static_asset(path: String) -> Response<Full<Bytes>> {
    match ASSETS_DIR.get_file(&path) {
        None => Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Full::from(format!("404 NOT FOUND")))
            .unwrap(),
        Some(file) => {
            let buffer: Vec<u8> = file.contents().iter().map(|c| *c).collect();
            let content_type = if path.ends_with(".js") {
                "application/javascript"
            } else if path.ends_with(".css") {
                "text/css"
            } else {
                "text/html; charset=utf8"
            };
            Response::builder()
                .status(StatusCode::OK)
                .header(
                    header::CONTENT_TYPE,
                    HeaderValue::from_str(content_type).unwrap(),
                )
                .body(Full::from(buffer))
                .unwrap()
        }
    }
}
