import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

export default class RightContent extends React.Component {
  render() {
    return (
      <Content
        className="site-layout-background site-layout-content"
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 500,
        }}
      >
        <Outlet></Outlet>
      </Content>
    );
  }
}
