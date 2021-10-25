use crate::error::Error;
use crate::error::Result;
use axum::body::Body;
use axum::body::Full;
use axum::extract::Extension;
use axum::http::Request;
use axum::http::Response;
use axum::response::IntoResponse;

#[derive(Clone, Debug)]
pub struct HttpProxyOptions {
    pub base_api: String,
}

pub async fn proxy_handler(
    request: Request<Body>,
    options: Extension<HttpProxyOptions>,
) -> Result<impl IntoResponse> {
    let base_api = options.0.base_api;
    let method = request.method().clone();
    let path = request
        .uri()
        .path_and_query()
        .map_or("/".to_string(), |p| p.as_str().to_string());
    let client = reqwest::Client::new();
    let req = client
        .request(method, format!("{}{}", base_api, path))
        .headers(request.headers().clone());
    let response = req
        .send()
        .await
        .map_err(|err| Error::InternalError(format!("request failed, cause: {}", err)))?;
    let mut builder = Response::builder().status(response.status());
    builder
        .headers_mut()
        .replace(&mut response.headers().clone());
    Ok(builder
        .body(Full::from(response.bytes().await.unwrap()))
        .unwrap())
}
