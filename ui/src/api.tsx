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
  const data = await resp.json();
  if (data.error) {
    return { status, error: data.error };
  }
  return { status, data };
}
