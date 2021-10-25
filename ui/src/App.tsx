import { useState } from "react";
import { Table } from "antd";
import { Layout } from "antd";
import { Button } from "antd";
import { Alert } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { sql, MySQL } from "@codemirror/lang-sql";
import { postStatement, StatementResponse } from "./api";
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

function App() {
  const [data, setData] = useState(sampleData);
  const [columns, setColumns] = useState(sampleColumns);
  const [sqlText, setSQLText] = useState("SELECT * FROM system.processlist;");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setError("");
    setLoading(true);
    try {
      const resp = await postStatement(sqlText);
      if (resp.error) {
        setError(`http error: ${resp.status} ${resp.error}`);
        return;
      }
      const data = resp.data as StatementResponse;
      const columns = processColumns(data);
      setData(data.data);
      setColumns(columns);
    } catch (err) {
      setError(`unexpected err: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Layout.Content
        className="site-layout"
        style={{ padding: "0 50px", marginTop: 64 }}
      >
        <div style={{ marginBottom: 16 }}>
          <CodeMirror
            value={sqlText}
            height="200px"
            extensions={[sql({ dialect: MySQL })]} // TODO: add tables hint allow auto complete
            onChange={(value, viewUpdate) => {
              setSQLText(value);
            }}
          />
        </div>

        {error.length > 0 && <Alert message={error} type="error" />}

        <p>
          <Button type="primary" onClick={handleRun} disabled={loading}>
            Run !
          </Button>
        </p>

        <Table columns={columns} dataSource={data} />
      </Layout.Content>
    </Layout>
  );
}

export default App;
