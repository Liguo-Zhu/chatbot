/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme, Typography, Avatar, Space } from "antd";
import { auth } from "./firebase/firebase";
import { signOut } from "firebase/auth";
import { useSelector } from "react-redux";
import { selectFirebaseUser } from "./store/authSlice";
import OpenAiChatBot from "./ChatBot/OpenAiChatBot";
import OpenAiAssistants from "./ChatBot/OpenAiAssistants";
const { Text } = Typography;

const { Header, Sider, Content, Footer } = Layout;

const Others = () => {
  return <p>Others......</p>;
};

export default function HomePage() {
  const user = useSelector(selectFirebaseUser);
  const [selectedNav, setSelectedNav] = useState("1"); // State to track selected navigation
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    setSelectedNav(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedNav]}
          // defaultSelectedKeys={["3"]}
          onClick={handleMenuClick}
          items={[
            {
              key: "1",
              icon: <RightCircleOutlined />,
              label: "Assistants API",
            },
            {
              key: "2",
              icon: <RightCircleOutlined />,
              label: "Chat API",
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Text style={{ marginLeft: 10 }}>
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
              </Text>
              <Text strong style={{ margin: 10 }}>
                {user?.profile?.email}
              </Text>
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => {
                if (confirm("Are you sure you want to log out?")) {
                  signOut(auth).catch((error) => {
                    // An error happened.
                    console.log(error);
                  });
                }
              }}
              style={{
                fontSize: "16px",
                width: "100px",
                height: "64px",
              }}
            >
              Log Out
            </Button>
          </div>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "24px 24px 0px 24px",
            padding: "24px",
            height: "calc(100vh-1px)", // Subtracting 1px to avoid overflow
            background: "colorBgContainer",
            borderRadius: "borderRadiusLG",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedNav === "1" && <OpenAiAssistants />}
          {selectedNav === "2" && <OpenAiChatBot />}
        </Content>
        <Footer style={{ textAlign: "center", padding: 10 }}>
          Chatbot ©{new Date().getFullYear()} Created by Liguo Zhu
        </Footer>
      </Layout>
    </Layout>
  );
}
