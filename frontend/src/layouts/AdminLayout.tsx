import { useState } from 'react';
import { Layout, Menu, Button, Typography, theme, Space, Drawer, Avatar, Tag } from 'antd';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { getMenuItems } from '@/config/navigation';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, organization, role, isSuperAdmin, hasPermission, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const menuItems = getMenuItems(role, hasPermission, t);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const headerTitle = isSuperAdmin
    ? t('nav.platform.adminLabel')
    : organization?.name ?? t('app.shortTitle');

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
        gap: 8,
      }}
    >
      {!isSuperAdmin && organization?.logo && !collapsed && (
        <Avatar src={organization.logo} size="small" />
      )}
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
          <Space>
            <Button
              type="text"
              icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
            />
            {!isMobile && (
              <Space size="small">
                {!isSuperAdmin && organization?.logo && (
                  <Avatar src={organization.logo} size="small" />
                )}
                <Typography.Text strong>{headerTitle}</Typography.Text>
              </Space>
            )}
          </Space>
          <Space size={isMobile ? 'small' : 'middle'} wrap>
            {role && !isMobile && (
              <Tag color={isSuperAdmin ? 'purple' : 'blue'}>{t(`roles.${role}`)}</Tag>
            )}
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
