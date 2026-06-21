import { useState } from 'react';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { getApiErrorMessage } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

interface LoginFormValues {
  email: string;
  password: string;
}

// TODO: remove before production — dev/test login defaults (see backend seed.ts)
const DEV_LOGIN_DEFAULTS: LoginFormValues = {
  email: 'admin@example.com',
  password: 'admin123456',
};

export function LoginPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<LoginFormValues>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      await login(values);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 40px rgba(15, 23, 42, 0.07)',
      }}
      styles={{ body: { padding: '28px 28px 32px' } }}
    >
      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8, color: '#0f172a' }}>
        {t('auth.signIn')}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {t('auth.signInSubtitle')}
      </Typography.Paragraph>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={import.meta.env.DEV ? DEV_LOGIN_DEFAULTS : undefined}
      >
        <Form.Item
          label={t('common.email')}
          name="email"
          rules={[
            { required: true, message: t('auth.emailRequired') },
            { type: 'email', message: t('auth.emailInvalid') },
          ]}
        >
          <Input placeholder={t('auth.emailPlaceholder')} size="large" />
        </Form.Item>

        <Form.Item
          label={t('auth.password')}
          name="password"
          rules={[{ required: true, message: t('auth.passwordRequired') }]}
        >
          <Input.Password placeholder={t('auth.passwordPlaceholder')} size="large" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          size="large"
          loading={loading}
          style={{ marginTop: 8, fontWeight: 600 }}
        >
          {t('auth.signIn')}
        </Button>
      </Form>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <LanguageSwitcher size="small" />
      </div>
    </Card>
  );
}
