/* eslint-disable no-unused-vars */
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function FormLogIn() {
  const navigate = useNavigate();
  const [error, seError] = useState(null);
  const onFinish = (values) => {
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        navigate("/"); // Redirect to the Home page
      })
      .catch((error) => {
        seError(error.message);
      });
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img
        src="/diagram.svg"
        alt="image"
        style={{ width: "50%", margin: "30px", borderRadius: "30px" }}
      ></img>
      <div>
        <Form
          name="normal_login"
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
              Log in
            </Button>
            Or
            <Link to="/register" style={{ color: "green", padding: "0 5px" }}>
              Register now!
            </Link>
          </Form.Item>
        </Form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <div className="font-light text-sm italic">
        <p>Note: You can use this account to log in to the site.</p>
        <p className="text-blue-500">
          Email: faker@gmail.com, Password: 123456
        </p>
        <p>Or you can register using a fake email address that you created.</p>
      </div>
    </div>
  );
}
