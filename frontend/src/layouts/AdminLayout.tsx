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
import { useTheme, useThemeTokens } from '@/contexts/ThemeContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { getMenuItems } from '@/config/navigation';
import { ScannerFab } from '@/components/common/ScannerFab';
import { roleTagColors } from '@/theme/statusColors';

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
  const { mode } = useTheme();
  const { border, text, brand } = useThemeTokens();

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
    <div className="admin-sider-logo">
      <span>{collapsed && !isMobile ? 'QR' : t('app.shortTitle')}</span>
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

  const logoutButton = (iconOnly = false) => (
    <div className={`admin-sider-logout${iconOnly ? ' admin-sider-logout--collapsed' : ''}`}>
      <Button
        block={!iconOnly}
        type="default"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        aria-label={t('nav.logout')}
        className="admin-logout-btn"
      >
        {iconOnly ? null : t('nav.logout')}
      </Button>
    </div>
  );

  return (
    <Layout className="admin-shell">
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          theme={mode}
          width={240}
          style={{ borderRight: `1px solid ${border.default}` }}
        >
          {siderLogo}
          {navMenu}
          {logoutButton(collapsed)}
        </Sider>
      )}

      <Drawer
        title={t('app.shortTitle')}
        placement="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
        width={260}
      >
        {navMenu}
        {logoutButton(false)}
      </Drawer>

      <Layout className="admin-main">
        <Header
          className="admin-header"
          style={{
            flexShrink: 0,
            lineHeight: 'normal',
            height: 64,
            background: token.colorBgContainer,
            padding: isMobile ? '0 16px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            borderBottom: `1px solid ${border.default}`,
          }}
        >
          <Button
            type="text"
            icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
            style={{ width: 36, height: 36 }}
          />

          <Space size={12} align="center" wrap={false} className="admin-header-actions">
            {role && !isMobile && (
              <Tag
                className="admin-role-tag"
                color={isSuperAdmin ? roleTagColors.superAdmin : roleTagColors.default}
                style={{ margin: 0, lineHeight: '22px', borderRadius: 6 }}
              >
                {t(`roles.${role}`)}
              </Tag>
            )}
            <ThemeToggle size="small" />
            <LanguageSwitcher size="small" compact={isMobile} />
            {!isMobile && (
              <div className="admin-header-identity">
                <div className="admin-header-org">
                  {!isSuperAdmin && organization?.logo && (
                    <Avatar src={organization.logo} size={28} />
                  )}
                  <Typography.Text
                    strong
                    style={{
                      color: text.primary,
                      fontSize: 15,
                      letterSpacing: '-0.01em',
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {headerTitle}
                  </Typography.Text>
                </div>
                {user?.name && (
                  <>
                    <span className="admin-header-sep" aria-hidden>
                      |
                    </span>
                    <div className="admin-header-user">
                      <Avatar
                        size={28}
                        src={user.photoUrl}
                        style={user.photoUrl ? undefined : { backgroundColor: brand.primary, fontSize: 13 }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography.Text
                        style={{
                          fontWeight: 500,
                          color: text.primary,
                          fontSize: 14,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.name}
                      </Typography.Text>
                    </div>
                  </>
                )}
              </div>
            )}
          </Space>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
        <ScannerFab />
      </Layout>
    </Layout>
  );
}
