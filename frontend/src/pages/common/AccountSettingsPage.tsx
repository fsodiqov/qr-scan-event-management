import { Button, Card, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfile';
import { getApiErrorMessage } from '@/utils/helpers';

interface AccountFormValues {
  name: string;
  login: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function AccountSettingsPage() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const [form] = Form.useForm<AccountFormValues>();
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        login: user.login ?? '',
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: AccountFormValues) => {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      message.error(t('accountSettings.passwordMismatch'));
      return;
    }

    const payload: {
      name?: string;
      login?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {};

    if (values.name !== user?.name) {
      payload.name = values.name;
    }

    const loginChanged = values.login !== (user?.login ?? '');
    if (loginChanged) {
      payload.login = values.login;
    }

    if (values.newPassword) {
      payload.newPassword = values.newPassword;
    }

    if (loginChanged || values.newPassword) {
      payload.currentPassword = values.currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      message.info(t('accountSettings.noChanges'));
      return;
    }

    try {
      await updateProfile.mutateAsync(payload);
      message.success(t('accountSettings.updated'));
      form.setFieldsValue({
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error, t('accountSettings.saveFailed')));
    }
  };

  return (
    <div>
      <PageHeader
        title={t('accountSettings.title')}
        subtitle={t('accountSettings.subtitle')}
      />

      <Card style={{ maxWidth: 640 }}>
        {role && (
          <p style={{ marginBottom: 16 }}>
            <strong>{t('accountSettings.role')}:</strong> {t(`roles.${role}`)}
          </p>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[{ required: true, message: t('accountSettings.nameRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="login"
            label={t('common.login')}
            rules={[{ required: true, message: t('accountSettings.loginRequired') }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={t('accountSettings.changePassword')} style={{ marginBottom: 0 }}>
            <p style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 16 }}>
              {t('accountSettings.passwordHint')}
            </p>
          </Form.Item>

          <Form.Item name="currentPassword" label={t('accountSettings.currentPassword')}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={t('accountSettings.newPassword')}
            rules={[{ min: 6, message: t('auth.passwordRequired') }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('accountSettings.confirmPassword')}
            dependencies={['newPassword']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const newPassword = getFieldValue('newPassword');
                  if (!newPassword || !value || newPassword === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('accountSettings.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={updateProfile.isPending}>
            {t('common.save')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
