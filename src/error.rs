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

use poem::http::StatusCode;
use poem::IntoResponse;
use poem::Response;
use serde_json::json;

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
    fn into_response(self) -> Response {
        let (status, output) = match self {
            Error::InternalError(s) => (StatusCode::INTERNAL_SERVER_ERROR, json!({ "message": s })),
            Error::ArgumentError(s) => (StatusCode::BAD_REQUEST, json!({ "message": s })),
        };

        Response::builder().status(status).body(output.to_string())
    }
}
