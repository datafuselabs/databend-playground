use axum::body::Bytes;
use axum::body::Full;
use axum::http::Response;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use serde_json::json;
use std::convert::Infallible;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Clone)]
pub enum Error {
    InternalError(String),
    ArgumentError(String),
}

impl std::error::Error for Error {}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Error::InternalError(s) => write!(f, "Internal error: {}", s),
            Error::ArgumentError(s) => write!(f, "Argument error: {}", s),
        }
    }
}

impl IntoResponse for Error {
    type Body = Full<Bytes>;
    type BodyError = Infallible;

    fn into_response(self) -> Response<Self::Body> {
        let (status, output) = match self {
            Error::InternalError(s) => (StatusCode::INTERNAL_SERVER_ERROR, json!({ "message": s })),
            Error::ArgumentError(s) => (StatusCode::BAD_REQUEST, json!({ "message": s })),
        };

        Response::builder()
            .status(status)
            .body(Full::from(output.to_string()))
            .unwrap()
    }
}
