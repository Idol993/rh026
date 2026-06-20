import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  HeartOutlined,
  BellOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, roleConfig } from '@/stores/authStore';
import { usePermission } from '@/hooks/usePermission';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  allowedRoles: Array<'director' | 'nurse' | 'caregiver' | 'family'>;
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: '管理大屏', path: '/director/dashboard', allowedRoles: ['director'] },
  { key: 'elders', icon: <TeamOutlined />, label: '老人档案', path: '/director/elders', allowedRoles: ['director'] },
  { key: 'health', icon: <HeartOutlined />, label: '健康监测', path: '/director/health', allowedRoles: ['director', 'nurse'] },
  { key: 'alerts', icon: <BellOutlined />, label: '预警中心', path: '/director/alerts', allowedRoles: ['director', 'nurse', 'caregiver'] },
  { key: 'services', icon: <FileTextOutlined />, label: '照护服务', path: '/director/services', allowedRoles: ['director', 'nurse', 'caregiver'] },
  { key: 'medication', icon: <MedicineBoxOutlined />, label: '用药管理', path: '/director/medication', allowedRoles: ['director', 'nurse'] },
  { key: 'visits', icon: <CalendarOutlined />, label: '探视预约', path: '/director/visits', allowedRoles: ['director', 'nurse', 'family'] },
  { key: 'finance', icon: <DollarOutlined />, label: '费用结算', path: '/director/finance', allowedRoles: ['director'] },
  { key: 'staff', icon: <UserOutlined />, label: '人员管理', path: '/director/staff', allowedRoles: ['director'] },
  { key: 'settings', icon: <SettingOutlined />, label: '系统设置', path: '/director/settings', allowedRoles: ['director'] },
];

const DirectorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole: checkRole } = useAuthStore();
  const { hasRole } = usePermission();
  const { token } = theme.useToken();

  const filteredMenuItems = menuItems.filter(item => hasRole(item.allowedRoles));

  const selectedKey = menuItems.find(item => 
    location.pathname.startsWith(item.path)
  )?.key || 'dashboard';

  const handleMenuClick = ({ key }: { key: string }) => {
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem) {
      navigate(menuItem.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回首页',
      onClick: () => navigate(user ? roleConfig[user.role].homePath : '/login'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #1565C0 0%, #1E88E5 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <div className="flex items-center gap-3 px-4">
            <span className="text-3xl">🏥</span>
            {!collapsed && (
              <span className="text-white font-bold text-lg tracking-wide" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                智慧养老平台
              </span>
            )}
          </div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={filteredMenuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          style={{
            background: 'transparent',
            borderRight: 0,
            paddingTop: '16px',
          }}
          className="custom-sider-menu"
        />

        <style>{`
          .custom-sider-menu .ant-menu-item {
            margin: 4px 12px !important;
            border-radius: 8px !important;
          }
          .custom-sider-menu .ant-menu-item-selected {
            background: rgba(255,255,255,0.2) !important;
          }
          .custom-sider-menu .ant-menu-item:hover {
            background: rgba(255,255,255,0.1) !important;
          }
        `}</style>
      </Sider>

      <Layout>
        <Header
          className="flex items-center justify-between px-6"
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="w-10 h-10 flex items-center justify-center"
            />
            <div className="hidden md:block">
              <span className="text-gray-500 text-sm">欢迎使用智慧养老照护平台</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge count={3} dot size="small">
              <Button
                type="text"
                icon={<BellOutlined className="text-xl text-gray-600" />}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg"
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size={40}
                  style={{
                    backgroundColor: '#1E88E5',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role ? roleConfig[user.role].label : ''}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content
          className="m-6 p-6 bg-white rounded-xl min-h-[calc(100vh-112px)]"
          style={{
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DirectorLayout;
