import { Button, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";

export default function FormRegister() {
  const navigate = useNavigate();
  const [error, seError] = useState(null);
  const onFinish = async (values) => {
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(() => {
        signOut(auth)
          .then(() => {
            navigate("/login"); // Redirect to the login page
          })
          .catch((error) => {
            seError(error.message);
          });
      })
      .catch((error) => {
        seError(error.message);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>
        <Form
          name="normal_register"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
          style={{ minWidth: "250px", margin: "0 auto" }}
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please input your Email!",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ margin: "0 10px", width: "70px" }}
            >
              Register
            </Button>
            Or
            <Link to="/login" style={{ color: "green", padding: "0 5px" }}>
              Log in now!
            </Link>
          </Form.Item>
        </Form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}
