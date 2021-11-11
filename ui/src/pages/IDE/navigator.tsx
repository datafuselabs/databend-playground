// Copyright 2020 Datafuse Labs.

import { useEffect, useState } from "react";
import { Select, Input, Space, Tree, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./css_navigator.module.scss";
import DatabaseSvg from "@/assets/svg/database";
import { getSqlStatement } from "@/apis/sql";
const { Option } = Select;
const { Search } = Input;
function Navigator() {
  const [database, setDatabase] = useState<Array<string>>([]);
  const handleDbChange = (value: string): void => {
    console.log(`selected ${value}`);
  };
  const onSearchTableOrFields = (value: string): void => {
    console.log(value);
  };
  const onSelect = (selectedKeys: any, info: any): void => {
    console.log("selected", selectedKeys, info);
  };
  useEffect(() => {
    getSqlStatement(`SELECT * FROM system.databases;`).then(response => {
      const tempValue = response.data || [];
      let tempDatabase: Array<string> = [];
      tempValue.map(item => {
        tempDatabase = [...tempDatabase, ...item];
      });
      setDatabase(tempDatabase);
    });
  }, []);
  const treeData = [
    {
      title: "parent 1",
      key: "0-0",
      children: [
        {
          title: "parent 1-0",
          key: "0-0-0",
        },
      ],
    },
    {
      title: "parent 1-1",
      key: "0-0-1",
      children: [
        {
          title: "leaf",
          key: "0-0-1-0",
        },
      ],
    },
  ];
  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row>
          <Col span={3}>
            <DatabaseSvg></DatabaseSvg>
          </Col>
          <Col span={20}>
            <Select style={{ width: "100%" }} onChange={handleDbChange}>
              {database.map(item => {
                return (
                  <Option key={item} value={item}>
                    {item}
                  </Option>
                );
              })}
            </Select>
          </Col>
        </Row>
        <Search placeholder="Search table / fields" onSearch={onSearchTableOrFields} enterButton />
      </Space>
      <div className={styles.treeArea}>
        <Tree showLine switcherIcon={<DownOutlined />} defaultExpandedKeys={["0-0-0"]} onSelect={onSelect} treeData={treeData}>
          3
        </Tree>
      </div>
    </>
  );
}

export default Navigator;
