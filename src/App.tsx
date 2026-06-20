import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import AppRoutes from "@/router";

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1E88E5",
          borderRadius: 8,
          fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Button: {
            algorithm: true,
            controlHeight: 40,
          },
          Input: {
            controlHeight: 40,
          },
        },
      }}
    >
      <AntdApp>
        <Router>
          <AppRoutes />
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}
