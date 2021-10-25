use axum::body::Bytes;
use axum::body::Full;
use axum::http::Response;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use std::convert::Infallible;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Clone)]
pub enum Error {
    InternalError(String),
}

impl std::error::Error for Error {}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Error::InternalError(s) => write!(f, "{}", s),
        }
    }
}

impl IntoResponse for Error {
    type Body = Full<Bytes>;
    type BodyError = Infallible;

    fn into_response(self) -> Response<Self::Body> {
        match self {
            Error::InternalError(s) => Response::builder()
                .status(StatusCode::INTERNAL_SERVER_ERROR)
                .body(Full::from(s))
                .unwrap(),
        }
    }
}
