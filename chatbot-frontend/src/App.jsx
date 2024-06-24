/* eslint-disable no-unused-vars */
import AppRoutes from "./AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthState } from "./store/authSlice";
import { useEffect } from "react";
import { Spin } from "antd";
import HomePage from "./HomePage";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(
    (state) => state.authAuthentication
  );

  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <Spin tip="Loading" size="large">
          <div
            style={{
              padding: 50,
              borderRadius: 4,
            }}
          />
        </Spin>
      </div>
    );
  }

  return <AppRoutes isAuthenticated={isAuthenticated} />;
}
