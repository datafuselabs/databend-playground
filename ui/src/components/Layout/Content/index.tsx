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
          padding: 24,
          marginBottom: "8px",
          minHeight: 500,
        }}
      >
        <Outlet></Outlet>
      </Content>
    );
  }
}
