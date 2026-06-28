import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PermissionRoute } from '@/routes/PermissionRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForbiddenPage } from '@/pages/common/ForbiddenPage';
import { AccountSettingsPage } from '@/pages/common/AccountSettingsPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ParticipantsPage } from '@/pages/admin/ParticipantsPage';
import { ParticipantFormPage } from '@/pages/admin/ParticipantFormPage';
import { ParticipantQrPage } from '@/pages/admin/ParticipantQrPage';
import { EventsPage } from '@/pages/admin/EventsPage';
import { AttendancePage } from '@/pages/admin/AttendancePage';
import { ScannerPage } from '@/pages/admin/ScannerPage';
import { StaffPage } from '@/pages/admin/StaffPage';
import { OrganizationUsersPage } from '@/pages/admin/OrganizationUsersPage';
import { OrganizationSettingsPage } from '@/pages/admin/OrganizationSettingsPage';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { PlatformDashboardPage } from '@/pages/platform/PlatformDashboardPage';
import { OrganizationsPage } from '@/pages/platform/OrganizationsPage';
import { OrganizationDetailPage } from '@/pages/platform/OrganizationDetailPage';
import { SubscriptionsPage } from '@/pages/platform/SubscriptionsPage';
import { PlatformSettingsPage } from '@/pages/platform/PlatformSettingsPage';
import { PERMISSIONS } from '@/constants/permissions';
import { LegacyUserEditRedirect, LegacyUserQrRedirect } from '@/routes/LegacyRedirects';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRouteForRole } from '@/utils/authRedirect';

function RootRedirect() {
  const { role } = useAuth();
  return <Navigate to={getDefaultRouteForRole(role)} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<RootRedirect />} />
          <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />
          <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettingsPage />} />

          <Route element={<PermissionRoute permission={PERMISSIONS.PLATFORM_DASHBOARD} />}>
            <Route path={ROUTES.PLATFORM_DASHBOARD} element={<PlatformDashboardPage />} />
            <Route path={ROUTES.PLATFORM_SETTINGS} element={<PlatformSettingsPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.PLATFORM_MANAGE_ORGANIZATIONS} />}>
            <Route path={ROUTES.ORGANIZATIONS} element={<OrganizationsPage />} />
            <Route path="/platform/organizations/:id" element={<OrganizationDetailPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.PLATFORM_MANAGE_SUBSCRIPTIONS} />}>
            <Route path={ROUTES.SUBSCRIPTIONS} element={<SubscriptionsPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_DASHBOARD} />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_EVENTS_READ} />}>
            <Route path={ROUTES.EVENTS} element={<EventsPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_PARTICIPANTS_MANAGE} />}>
            <Route path={ROUTES.PARTICIPANTS} element={<ParticipantsPage />} />
            <Route path={ROUTES.PARTICIPANT_NEW} element={<ParticipantFormPage />} />
            <Route path="/admin/participants/:id/edit" element={<ParticipantFormPage />} />
            <Route path="/admin/participants/:id/qr" element={<ParticipantQrPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_ATTENDANCE_MANAGE} />}>
            <Route path={ROUTES.ATTENDANCE} element={<AttendancePage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_ATTENDANCE_SCAN} />}>
            <Route path={ROUTES.SCANNER} element={<ScannerPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_USERS_MANAGE} />}>
            <Route path={ROUTES.STAFF} element={<StaffPage />} />
            <Route path={ROUTES.ORG_USERS} element={<OrganizationUsersPage />} />
          </Route>

          <Route element={<PermissionRoute permission={PERMISSIONS.ORG_SETTINGS} />}>
            <Route path={ROUTES.ORG_SETTINGS} element={<OrganizationSettingsPage />} />
          </Route>

          <Route path={ROUTES.LEGACY_ORG_SETTINGS} element={<Navigate to={ROUTES.ORG_SETTINGS} replace />} />

          {/* Legacy redirects */}
          <Route path={ROUTES.USERS} element={<Navigate to={ROUTES.PARTICIPANTS} replace />} />
          <Route path={ROUTES.USER_NEW} element={<Navigate to={ROUTES.PARTICIPANT_NEW} replace />} />
          <Route path="/admin/users/:id/edit" element={<LegacyUserEditRedirect />} />
          <Route path="/admin/users/:id/qr" element={<LegacyUserQrRedirect />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
