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

import { useState } from "react";
import { Table } from "antd";
import { Layout } from "antd";
import { Button } from "antd";
import { Alert } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { sql, MySQL } from "@codemirror/lang-sql";
import { postStatement, StatementResponse } from "apis/api";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/sql-hint.js";
import "codemirror/theme/ambiance.css";
import "antd/dist/antd.css";

const sampleData = [["1", "Mike", 32]];

const sampleColumns = [
  {
    title: "Name",
    dataIndex: 0,
    key: "name",
  },
  {
    title: "Age",
    dataIndex: 1,
    key: "age",
  },
  {
    title: "Address",
    dataIndex: 2,
    key: "address",
  },
];

function processColumns(data: StatementResponse) {
  return data.columns.fields.map(function (field, idx) {
    return {
      title: field.name,
      key: field.name,
      dataIndex: idx,
    };
  });
}

function useStatementForm(statement: string) {
  const [data, setData] = useState(sampleData);
  const [columns, setColumns] = useState(sampleColumns);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunStatement = async () => {
    setError("");
    setLoading(true);
    try {
      const resp = await postStatement(statement);
      if (resp.error) {
        setError(`Query error: ${resp.error}`);
        setData([]);
        return;
      }
      const data = resp.data as StatementResponse;
      const columns = processColumns(data);
      setData(data.data);
      setColumns(columns);
    } catch (err) {
      setError(`Unexpected err: ${err}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    data,
    columns,
    handleRunStatement,
  };
}

function App() {
  const [statement, setStatement] = useState("SELECT * FROM system.processes;");
  let { loading, error, data, columns, handleRunStatement } = useStatementForm(statement);

  return (
    <Layout>
      <Layout.Content className="site-layout" style={{ padding: "0 50px", marginTop: 64 }}>
        <div style={{ marginBottom: 16 }}>
          <CodeMirror
            value={statement}
            height="200px"
            extensions={[sql({ dialect: MySQL })]} // TODO: add tables hint allow auto complete
            onChange={(value, viewUpdate) => {
              setStatement(value);
            }}
          />
        </div>

        {error.length > 0 && (
          <p>
            <Alert message={error} type="error" />
          </p>
        )}

        <p>
          <Button type="primary" onClick={handleRunStatement} disabled={loading}>
            Run !
          </Button>
        </p>

        <Table columns={columns} dataSource={data} />
      </Layout.Content>
    </Layout>
  );
}

export default App;
