import { FC, ReactElement, useState } from "react";
import { Layout } from "antd";
import RightContent from "./Content";
import MenuSide from "./Sider";
import TopHeader from "./Header";

const MainLayout: FC = (): ReactElement => {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => {
    setCollapsed(!collapsed);
  };
  return (
    <Layout>
      <MenuSide collapsed={collapsed} />
      <Layout className="site-layout site-layout-right">
        <TopHeader collapsed={collapsed} toggle={toggle} />
        <RightContent />
      </Layout>
    </Layout>
  );
};
export default MainLayout;
