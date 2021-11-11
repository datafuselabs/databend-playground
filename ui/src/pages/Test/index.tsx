import { Button } from "antd";
import { getSqlStatement } from "apis/sql";
function Test() {
  const run = async () => {
    let data = await getSqlStatement("SELECT * FROM system.processes;");
    console.log(data);
  };
  return <Button onClick={run}>test ajax</Button>;
}

export default Test;
