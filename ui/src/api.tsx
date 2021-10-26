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

export interface APIResponse<T, E> {
  status: number;
  error?: E;
  data?: T;
}

export interface StatementResponse {
  id: string;
  nextUri: string;
  data: Array<Array<any>>;
  columns: {
    fields: Array<{
      name: string;
      data_type: string;
      nullable: boolean;
    }>;
  };
}

export async function postStatement(
  sqlText: string
): Promise<APIResponse<StatementResponse, string>> {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/text" },
    body: sqlText,
  };
  let resp = await fetch("/v1/statement", options);
  let status = resp.status;
  if (!resp.ok) {
    return { status, error: (await resp.json()).message };
  }
  const data = await resp.json();
  if (data.error) {
    return { status, error: data.error };
  }
  return { status, data };
}
