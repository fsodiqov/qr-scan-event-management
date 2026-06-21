import { useState } from 'react';
import { Layout, Menu, Button, Typography, theme, Space } from 'antd';
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
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ROUTES } from '@/utils/constants';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const menuItems = [
    { key: ROUTES.DASHBOARD, icon: <DashboardOutlined />, label: <Link to={ROUTES.DASHBOARD}>{t('nav.dashboard')}</Link> },
    { key: ROUTES.USERS, icon: <TeamOutlined />, label: <Link to={ROUTES.USERS}>{t('nav.users')}</Link> },
    { key: ROUTES.EVENTS, icon: <CalendarOutlined />, label: <Link to={ROUTES.EVENTS}>{t('nav.events')}</Link> },
    { key: ROUTES.ATTENDANCE, icon: <UnorderedListOutlined />, label: <Link to={ROUTES.ATTENDANCE}>{t('nav.attendance')}</Link> },
    { key: ROUTES.SCANNER, icon: <ScanOutlined />, label: <Link to={ROUTES.SCANNER}>{t('nav.scanner')}</Link> },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <Layout className="admin-shell">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        theme="light"
        style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div
          style={{
            height: 64,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 16,
            padding: '0 12px',
          }}
        >
          {collapsed ? 'QR' : t('app.shortTitle')}
        </div>
        <Menu
          mode="inline"
          className="admin-sider-menu"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout className="admin-main">
        <Header
          style={{
            flexShrink: 0,
            lineHeight: 'normal',
            height: 64,
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
          <Space size="middle">
            <LanguageSwitcher size="small" />
            <Typography.Text>{user?.name}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
