import { FC, ReactElement } from "react";
import { Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

const { Header } = Layout;

interface Iprops {
  collapsed: boolean;
  toggle: () => void;
}

const TopHeader: FC<Iprops> = ({ collapsed, toggle }): ReactElement => {
  return (
    <Header className="site-layout-background site-layout-header" style={{ padding: 0 }}>
      <span className="trigger" onClick={toggle}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </span>
    </Header>
  );
};
export default TopHeader;
