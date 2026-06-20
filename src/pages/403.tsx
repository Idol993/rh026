import { Result, Button } from 'antd';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';

const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGoHome = () => {
    if (user) {
      navigate(roleConfig[user.role].homePath);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问该页面"
        icon={<LockOutlined className="text-6xl text-orange-500" />}
        extra={[
          <Button
            type="primary"
            key="home"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            size="large"
            style={{ borderRadius: '8px' }}
          >
            返回首页
          </Button>,
        ]}
        className="bg-white rounded-2xl shadow-xl p-8"
      />
    </div>
  );
};

export default ForbiddenPage;
