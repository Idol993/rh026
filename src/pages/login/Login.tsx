import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Tabs, TabsProps, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';
import type { UserRole } from '@/stores/authStore';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [shakeError, setShakeError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = (location.state as { from?: string })?.from || roleConfig[user.role].homePath;
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  useEffect(() => {
    if (shakeError) {
      const timer = setTimeout(() => setShakeError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shakeError]);

  const handleRoleChange = (key: string) => {
    setSelectedRole(key as UserRole);
    form.resetFields();
  };

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.username, values.password, selectedRole);
      if (success) {
        message.success(`欢迎登录，${roleConfig[selectedRole].label}端`);
        const redirectPath = (location.state as { from?: string })?.from || roleConfig[selectedRole].homePath;
        navigate(redirectPath, { replace: true });
      } else {
        message.error('账号或密码错误，请重试');
        setShakeError(true);
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
    setShakeError(true);
  };

  const roleTabs: TabsProps['items'] = (Object.keys(roleConfig) as UserRole[]).map((role) => ({
    key: role,
    label: (
      <span className="flex items-center gap-2 text-base">
        <span className="text-xl">{roleConfig[role].icon}</span>
        <span>{roleConfig[role].label}端</span>
      </span>
    ),
  }));

  const getTestAccountHint = () => {
    const hints: Partial<Record<UserRole, string>> = {
      director: '测试账号：director / 123456',
      nurse: '测试账号：nurse / 123456',
      caregiver: '测试账号：caregiver / 123456',
      family: '测试账号：family / 123456',
    };
    return hints[selectedRole] || '测试账号：director / 123456';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1565C0] via-[#1E88E5] to-[#42A5F5] p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF9800]/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <span className="text-5xl">🏥</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            智慧养老照护平台
          </h1>
          <p className="text-white/80 text-base">让养老更智慧，让照护更有温度</p>
        </div>

        <Card
          className={`shadow-2xl backdrop-blur-md bg-white/95 border-0 rounded-2xl overflow-hidden transition-all duration-300 ${
            shakeError ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
          styles={{ body: { padding: 0 } }}
        >
          <div className="p-6 md:p-8">
            <Tabs
              activeKey={selectedRole}
              onChange={handleRoleChange}
              items={roleTabs}
              centered
              className="mb-6"
              style={{
                '--indicator-color': '#1E88E5',
              } as React.CSSProperties}
            />

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label={<span className="text-gray-700 font-medium">账号</span>}
                rules={[
                  { required: true, message: '请输入账号' },
                  { min: 3, message: '账号至少3个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入登录账号"
                  className="h-12 rounded-lg text-base"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-700 font-medium">密码</span>}
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入登录密码"
                  className="h-12 rounded-lg text-base"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Alert
                message={<span style={{ color: '#1565C0', fontWeight: 500 }}>{getTestAccountHint()}</span>}
                type="info"
                showIcon
                className="mb-6 bg-blue-50 border-blue-200"
              />

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<LoginOutlined />}
                  className="h-12 text-base font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(30, 136, 229, 0.4)',
                  }}
                >
                  {loading ? '登录中...' : '安全登录'}
                </Button>
              </Form.Item>
            </Form>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              © 2024 智慧养老照护平台 版权所有
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            技术支持：智能养老 · 健康守护 · 专业服务
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
