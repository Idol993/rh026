import { Layout, Avatar, Badge, Button, Dropdown } from 'antd';
import {
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';

const { Header, Content, Footer } = Layout;

interface TabItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const tabItems: TabItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: '首页', path: '/family/home' },
  { key: 'health', icon: <HeartOutlined />, label: '健康', path: '/family/health' },
  { key: 'services', icon: <FileTextOutlined />, label: '服务', path: '/family/services' },
  { key: 'visits', icon: <CalendarOutlined />, label: '探视', path: '/family/visits' },
  { key: 'bills', icon: <DollarOutlined />, label: '账单', path: '/family/bills' },
];

const FamilyLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const activeKey = tabItems.find(item => 
    location.pathname.startsWith(item.path)
  )?.key || 'home';

  const handleTabClick = (key: string) => {
    const tabItem = tabItems.find(item => item.key === key);
    if (tabItem) {
      navigate(tabItem.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50 max-w-lg mx-auto" style={{ boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      <Header
        className="flex items-center justify-between px-4 sticky top-0 z-50"
        style={{
          background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
          height: '56px',
          lineHeight: '56px',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Serif SC', serif" }}>
            家属端
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge count={2} dot size="small">
            <Button
              type="text"
              icon={<BellOutlined className="text-xl text-white" />}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg"
            />
          </Badge>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-lg transition-colors">
              <Avatar
                size={32}
                style={{
                  backgroundColor: '#FF9800',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
              <span className="text-white text-sm font-medium hidden sm:inline">
                {user?.name}
              </span>
            </div>
          </Dropdown>
        </div>
      </Header>

      <Content className="flex-1 overflow-auto pb-20">
        <Outlet />
      </Content>

      <Footer
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 px-0 py-0 z-50"
        style={{ padding: 0 }}
      >
        <div className="flex justify-around items-center h-16">
          {tabItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleTabClick(item.key)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                activeKey === item.key
                  ? 'text-[#1E88E5]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div
                className={`text-2xl mb-1 transition-transform duration-200 ${
                  activeKey === item.key ? 'scale-110' : ''
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  activeKey === item.key ? 'text-[#1E88E5]' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {activeKey === item.key && (
                <div className="absolute bottom-0 w-12 h-1 bg-[#1E88E5] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </Footer>
    </Layout>
  );
};

export default FamilyLayout;
