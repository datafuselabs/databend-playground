use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use std::collections::HashMap;

#[derive(serde::Deserialize)]
pub struct QueryRequest {
    pub sql: String,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SampleQueryResponse {
    pub rows: Vec<HashMap<String, String>>,
}

pub async fn query_handler(Json(_payload): Json<QueryRequest>) -> impl IntoResponse {
    let mut sample_row = HashMap::new();
    sample_row.insert("name".into(), "who".into());
    sample_row.insert("age".into(), "9".into());
    sample_row.insert("price".into(), "0".into());
    let sample = SampleQueryResponse {
        rows: vec![sample_row.clone(), sample_row.clone()],
    };
    (StatusCode::OK, Json(sample))
}
