import { useState } from 'react';
import { Layout, Menu, Button, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  ScanOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: ROUTES.DASHBOARD, icon: <DashboardOutlined />, label: <Link to={ROUTES.DASHBOARD}>Dashboard</Link> },
  { key: ROUTES.USERS, icon: <TeamOutlined />, label: <Link to={ROUTES.USERS}>Users</Link> },
  { key: ROUTES.EVENTS, icon: <CalendarOutlined />, label: <Link to={ROUTES.EVENTS}>Events</Link> },
  { key: ROUTES.ATTENDANCE, icon: <UnorderedListOutlined />, label: <Link to={ROUTES.ATTENDANCE}>Attendance Logs</Link> },
  { key: ROUTES.SCANNER, icon: <ScanOutlined />, label: <Link to={ROUTES.SCANNER}>QR Scanner</Link> },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 16,
            padding: '0 12px',
          }}
        >
          {collapsed ? 'QR' : 'QR Attendance'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderInlineEnd: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Typography.Text>{user?.name}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
