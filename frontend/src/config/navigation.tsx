import type { TFunction } from 'i18next';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  ScanOutlined,
  BankOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PERMISSIONS, type Permission } from '@/constants/permissions';
import { ROUTES } from '@/utils/constants';
import type { Role } from '@/types';

interface NavItem {
  key: string;
  permission: Permission;
  icon: React.ReactNode;
  label: React.ReactNode;
}

function buildPlatformItems(t: TFunction): NavItem[] {
  return [
    {
      key: ROUTES.PLATFORM_DASHBOARD,
      permission: PERMISSIONS.PLATFORM_DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.PLATFORM_DASHBOARD}>{t('nav.platform.dashboard')}</Link>,
    },
    {
      key: ROUTES.ORGANIZATIONS,
      permission: PERMISSIONS.PLATFORM_MANAGE_ORGANIZATIONS,
      icon: <BankOutlined />,
      label: <Link to={ROUTES.ORGANIZATIONS}>{t('nav.platform.organizations')}</Link>,
    },
    {
      key: ROUTES.SUBSCRIPTIONS,
      permission: PERMISSIONS.PLATFORM_MANAGE_SUBSCRIPTIONS,
      icon: <CreditCardOutlined />,
      label: <Link to={ROUTES.SUBSCRIPTIONS}>{t('nav.platform.subscriptions')}</Link>,
    },
  ];
}

function buildOrgItems(t: TFunction): NavItem[] {
  return [
    {
      key: ROUTES.DASHBOARD,
      permission: PERMISSIONS.ORG_DASHBOARD,
      icon: <DashboardOutlined />,
      label: <Link to={ROUTES.DASHBOARD}>{t('nav.dashboard')}</Link>,
    },
    {
      key: ROUTES.EVENTS,
      permission: PERMISSIONS.ORG_EVENTS_READ,
      icon: <CalendarOutlined />,
      label: <Link to={ROUTES.EVENTS}>{t('nav.events')}</Link>,
    },
    {
      key: ROUTES.PARTICIPANTS,
      permission: PERMISSIONS.ORG_PARTICIPANTS_MANAGE,
      icon: <TeamOutlined />,
      label: <Link to={ROUTES.PARTICIPANTS}>{t('nav.participants')}</Link>,
    },
    {
      key: ROUTES.ATTENDANCE,
      permission: PERMISSIONS.ORG_ATTENDANCE_MANAGE,
      icon: <UnorderedListOutlined />,
      label: <Link to={ROUTES.ATTENDANCE}>{t('nav.attendance')}</Link>,
    },
    {
      key: ROUTES.SCANNER,
      permission: PERMISSIONS.ORG_ATTENDANCE_SCAN,
      icon: <ScanOutlined />,
      label: <Link to={ROUTES.SCANNER}>{t('nav.scanner')}</Link>,
    },
    {
      key: ROUTES.ORG_USERS,
      permission: PERMISSIONS.ORG_USERS_MANAGE,
      icon: <UsergroupAddOutlined />,
      label: <Link to={ROUTES.ORG_USERS}>{t('nav.orgUsers')}</Link>,
    },
    {
      key: ROUTES.REPORTS,
      permission: PERMISSIONS.ORG_DASHBOARD,
      icon: <BarChartOutlined />,
      label: <Link to={ROUTES.REPORTS}>{t('nav.reports')}</Link>,
    },
    {
      key: ROUTES.ORG_SETTINGS,
      permission: PERMISSIONS.ORG_SETTINGS,
      icon: <ShopOutlined />,
      label: <Link to={ROUTES.ORG_SETTINGS}>{t('nav.orgSettings')}</Link>,
    },
  ];
}

function buildAccountSettingsItem(t: TFunction): MenuProps['items'] {
  return [
    {
      key: ROUTES.ACCOUNT_SETTINGS,
      icon: <UserOutlined />,
      label: <Link to={ROUTES.ACCOUNT_SETTINGS}>{t('nav.accountSettings')}</Link>,
    },
  ];
}

export function getMenuItems(
  role: Role | null,
  hasPermission: (p: Permission) => boolean,
  t: TFunction,
): MenuProps['items'] {
  const items = role === 'super_admin' ? buildPlatformItems(t) : buildOrgItems(t);

  const filtered = items
    .filter((item) => hasPermission(item.permission))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  return [...filtered, ...(buildAccountSettingsItem(t) ?? [])];
}
