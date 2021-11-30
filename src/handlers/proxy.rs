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

use crate::error::Error;
use crate::error::Result;
use poem::handler;
use poem::web::Data;
use poem::Body;
use poem::IntoResponse;
use poem::Request;

#[derive(Clone, Debug)]
pub struct HttpProxyOptions {
    pub base_api: String,
}

#[handler]
pub async fn proxy_handler(
    body: Body,
    request: &Request,
    Data(ref options): Data<&HttpProxyOptions>,
) -> Result<impl IntoResponse> {
    let base_api = options.base_api.clone();
    let method = request.method().clone();
    let path = request
        .uri()
        .path_and_query()
        .map_or("/".to_string(), |p| p.as_str().to_string());

    let client = reqwest::Client::new();
    let headers = request.headers().clone();
    let body = body
        .into_bytes()
        .await
        .map_err(|err| Error::InternalError(format!("error on read body: {:?}", err)))?;
    let req = client
        .request(method, format!("{}{}", base_api, path))
        .headers(headers)
        .body(body);
    let response = req
        .send()
        .await
        .map_err(|err| Error::InternalError(format!("request failed, cause: {}", err)))?;

    let status = response.status();
    let headers = response.headers().clone();
    let output = response.bytes().await.unwrap();
    Ok((status, headers, output))
}
