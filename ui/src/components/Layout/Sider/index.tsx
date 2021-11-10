import { FC, ReactElement, useState } from "react";
import { Layout } from "antd";
import logoImg from "assets/images/common/logo.png";
import styles from "./index.module.scss";
import { Link } from "react-router-dom";
import Menu from "./Menu";
const { Sider } = Layout;

interface Iprops {
  collapsed: boolean;
}

const MenuSider: FC<Iprops> = ({ collapsed }): ReactElement => {
  const [selectedKey, setSelectedKey] = useState<string>("1");
  const handlerImages = () => {
    setSelectedKey("1");
  };
  const menuClick = (e: any) => {
    setSelectedKey(e.key);
  };
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <Link to="/" className={styles.logoWrap}>
        <img src={logoImg} alt="logo" className={styles.logo} onClick={handlerImages} />
      </Link>
      <Menu selectedKey={selectedKey} menuClick={menuClick} />
    </Sider>
  );
};
export default MenuSider;
