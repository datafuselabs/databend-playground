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
        .body(Full::from(buffer))
        .unwrap()
}
