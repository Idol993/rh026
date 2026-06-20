import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';

const NotFoundPage = () => {
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
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
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

export default NotFoundPage;
