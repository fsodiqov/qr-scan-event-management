import { useState } from 'react';
import { Layout, Menu, Button, Typography, theme, Space, Drawer } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  ScanOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
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

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const siderLogo = (
    <div
      style={{
        height: 64,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: collapsed && !isMobile ? 14 : 16,
        padding: '0 12px',
      }}
    >
      {collapsed && !isMobile ? 'QR' : t('app.shortTitle')}
    </div>
  );

  const navMenu = (
    <Menu
      mode="inline"
      className="admin-sider-menu"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
    />
  );

  return (
    <Layout className="admin-shell">
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          theme="light"
          style={{ borderRight: `1px solid ${token.colorBorderSecondary}` }}
        >
          {siderLogo}
          {navMenu}
        </Sider>
      )}

      <Drawer
        title={t('app.shortTitle')}
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
        width={260}
      >
        {navMenu}
      </Drawer>

      <Layout className="admin-main">
        <Header
          style={{
            flexShrink: 0,
            lineHeight: 'normal',
            height: 64,
            background: token.colorBgContainer,
            padding: isMobile ? '0 16px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
          />
          <Space size={isMobile ? 'small' : 'middle'}>
            <LanguageSwitcher size="small" compact={isMobile} />
            {!isMobile && <Typography.Text>{user?.name}</Typography.Text>}
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              aria-label={t('nav.logout')}
            >
              {isMobile ? null : t('nav.logout')}
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
