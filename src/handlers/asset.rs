use axum::body::Bytes;
use axum::body::Full;
use axum::http::Response;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use std::convert::Infallible;

#[derive(serde::Serialize)]
pub struct AssetResponse {
    content: String,
}

impl IntoResponse for AssetResponse {
    type Body = Full<Bytes>;
    type BodyError = Infallible;

    fn into_response(self) -> Response<Self::Body> {
        Response::builder()
            .status(StatusCode::OK)
            .body(Full::from("_".to_string()))
            .unwrap()
    }
}

pub async fn asset_handler() -> impl IntoResponse {
    AssetResponse {
        content: "".to_string(),
    }
}
