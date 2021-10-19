import { useState } from "react";
import { Table } from "antd";
import { Layout } from "antd";
import { Button } from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { sql, MySQL } from "@codemirror/lang-sql";
import { useFetch } from "use-http";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/sql/sql";
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/sql-hint.js";
import "codemirror/theme/ambiance.css";
import "antd/dist/antd.css";

const sampleData = [
  {
    key: "1",
    name: "Mike",
    age: 32,
    address: "10 Downing Street",
  },
  {
    key: "2",
    name: "John",
    age: 42,
    address: "10 Downing Street",
  },
];

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
    key: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

function App() {
  const [data, setData] = useState(sampleData);
  const [sqlText, setSQLText] = useState("SELECT * FROM system.processlist;");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/queries");
      if (!resp.ok) {
        alert(`http error: ${resp.status} ${resp.body}`);
        return;
      }
      const data = await resp.json();
      setData(data);
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
