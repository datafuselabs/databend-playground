import { FC, ReactElement, useImperativeHandle, forwardRef, useState } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { allRouter } from "@/router";
interface Iprops {
  selectedKey: string;
  menuClick: (e: any) => void;
}
let MenuList: FC<Iprops> = ({ selectedKey, menuClick }): ReactElement => {
  let menuList = allRouter[0].children;
  return (
    <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
      {menuList &&
        menuList.map((item, key) => {
          return (
            <Menu.Item onClick={menuClick} key={key + 1} icon={item.icon}>
              <Link to={String(item.path)}>{item.label}</Link>
            </Menu.Item>
          );
        })}
    </Menu>
  );
};
export default MenuList;
