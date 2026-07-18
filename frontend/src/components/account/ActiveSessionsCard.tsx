import { Button, Card, List, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { DesktopOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useThemeTokens } from '@/contexts/ThemeContext';
import { useLogoutAllSessions, useRevokeSession, useSessions } from '@/hooks/useSessions';
import { getApiErrorMessage } from '@/utils/helpers';

function shortUserAgent(ua?: string): string {
  if (!ua) return '—';
  if (ua.length <= 72) return ua;
  return `${ua.slice(0, 69)}…`;
}

export function ActiveSessionsCard() {
  const { t } = useTranslation();
  const { border, radius, shadow, text } = useThemeTokens();
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const logoutAll = useLogoutAllSessions();

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession.mutateAsync(id);
      message.success(t('accountSettings.sessionRevoked'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('accountSettings.sessionRevokeFailed')));
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll.mutateAsync();
    } catch (error) {
      message.error(getApiErrorMessage(error, t('accountSettings.logoutAllFailed')));
    }
  };

  return (
    <Card
      bordered={false}
      className="account-settings-card"
      style={{
        maxWidth: 640,
        marginTop: 24,
        borderRadius: radius.card,
        border: `1px solid ${border.default}`,
        boxShadow: shadow.small,
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <Typography.Title
            level={5}
            style={{ margin: '0 0 8px', fontWeight: 600, color: text.primary }}
          >
            {t('accountSettings.sessionsTitle')}
          </Typography.Title>
          <Typography.Text style={{ fontSize: 13, color: text.secondary }}>
            {t('accountSettings.sessionsHint')}
          </Typography.Text>
        </div>
        <Popconfirm
          title={t('accountSettings.logoutAllConfirm')}
          onConfirm={() => void handleLogoutAll()}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
        >
          <Button
            danger
            icon={<LogoutOutlined />}
            loading={logoutAll.isPending}
            disabled={!sessions?.length}
          >
            {t('accountSettings.logoutAll')}
          </Button>
        </Popconfirm>
      </div>

      <List
        loading={isLoading}
        locale={{ emptyText: t('accountSettings.noSessions') }}
        dataSource={sessions ?? []}
        renderItem={(session) => (
          <List.Item
            actions={[
              session.current ? (
                <Tag key="current" color="blue">
                  {t('accountSettings.currentSession')}
                </Tag>
              ) : (
                <Popconfirm
                  key="revoke"
                  title={t('accountSettings.revokeConfirm')}
                  onConfirm={() => void handleRevoke(session.id)}
                  okText={t('common.confirm')}
                  cancelText={t('common.cancel')}
                >
                  <Button
                    size="small"
                    danger
                    loading={revokeSession.isPending}
                  >
                    {t('accountSettings.revokeSession')}
                  </Button>
                </Popconfirm>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={<DesktopOutlined style={{ fontSize: 20, color: text.secondary }} />}
              title={
                <Space wrap size={8}>
                  <span>{shortUserAgent(session.userAgent)}</span>
                  {session.rememberMe && (
                    <Tag>{t('accountSettings.rememberedSession')}</Tag>
                  )}
                </Space>
              }
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {session.ip ? `${session.ip} · ` : ''}
                  {t('accountSettings.sessionCreated', {
                    date: dayjs(session.createdAt).format('YYYY-MM-DD HH:mm'),
                  })}
                  {' · '}
                  {t('accountSettings.sessionExpires', {
                    date: dayjs(session.expiresAt).format('YYYY-MM-DD HH:mm'),
                  })}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
